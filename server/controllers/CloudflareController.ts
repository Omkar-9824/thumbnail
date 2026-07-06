import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const stylePrompts = {
    'Bold & Graphic':
        'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
    'Tech/Futuristic':
        'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
    'Minimalist':
        'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
    'Photorealistic':
        'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
    'Illustrated':
        'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
};

const colorSchemeDescriptions = {
    'vibrant': 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
    'sunset': 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
    'forest': 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
    'neon': 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
    'purple': 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
    'monochrome': 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
    'ocean': 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
    'pastel': 'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
};


const CF_MODEL = '@cf/black-forest-labs/flux-1-schnell';


const aspectRatioDimensions: Record<string, { width: number; height: number }> = {
    '16:9': { width: 1360, height: 768 },
    '9:16': { width: 768, height: 1360 },
    '1:1': { width: 1024, height: 1024 },
    '4:3': { width: 1024, height: 768 },
};

export const generateThumbnail = async (req: Request, res: Response) => {
    try {
        console.log("Thumbnail generation started");
        const { userId } = req.session;
        const {
            title,
            prompt: user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
        } = req.body;


        const thumbnail = await Thumbnail.create({
            userId,
            title,
            prompt_used: user_prompt,
            user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true,
        });


        let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}"`;

        if (color_scheme) {
            prompt += ` Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]
                } color scheme.`;
        }
        
        if (user_prompt) {
            prompt += ` Additional details: ${user_prompt}.`;
        }

        prompt +=
            ` The thumbnail should be ${aspect_ratio}, visually stunning, and` +
            ` designed to maximize click-through rate. Make it bold, professional,` +
            ` and impossible to ignore.`;
            

        const dimensions =
            aspectRatioDimensions[aspect_ratio] ?? aspectRatioDimensions['16:9'];


        const cfAccountId = process.env.CF_ACCOUNT_ID;
        const cfApiToken = process.env.CF_API_TOKEN;

        const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/${CF_MODEL}`;

        const cfResponse = await fetch(cfUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${cfApiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                width: dimensions.width,
                height: dimensions.height,
                steps: 4,
            }),
        });

        if (!cfResponse.ok) {
            const errText = await cfResponse.text();
            throw new Error(
                `Cloudflare Workers AI error ${cfResponse.status}: ${errText}`
            );
        }


        const cfJson = await cfResponse.json() as {
            result: { image: string };
            success: boolean;
            errors: string[];
        };

        if (!cfJson.success || !cfJson.result?.image) {
            throw new Error(
                `Cloudflare Workers AI returned no image. Errors: ${JSON.stringify(cfJson.errors)}`
            );
        }

        const imageBuffer = Buffer.from(cfJson.result.image, 'base64');

        
        fs.mkdirSync('images', { recursive: true });
        const filename = `cf-output-${Date.now()}.png`;
        const filePath = path.join('images', filename);
        fs.writeFileSync(filePath, imageBuffer);

        let uploadResult;
        try {
            uploadResult = await cloudinary.uploader.upload(filePath, {
                resource_type: 'image',
            });
        } catch (uploadErr: any) {
            console.error("Cloudinary Upload Error:", uploadErr);
            throw new Error(`Cloudinary Upload Failed: ${uploadErr.message}`);
        }


        thumbnail.image_url = uploadResult.url;
        thumbnail.isGenerating = false;
        await thumbnail.save();
        const finalThumbnail = await Thumbnail.findById(thumbnail._id).lean();

        res.status(200).json({ message: 'Thumbnail Generated', finalThumbnail });


    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.session;

        const result = await Thumbnail.findOneAndDelete({ _id: id, userId });
        if (!result) {
            return res.status(404).json({ message: "Thumbnail not found or unauthorized" });
        }
        res.json({ message: "Thumbnail deleted successfully" });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
