"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteThumbnail = exports.generateThumbnail = void 0;
const Thumbnail_1 = __importDefault(require("../models/Thumbnail"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const stylePrompts = {
    'Bold & Graphic': 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
    'Tech/Futuristic': 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
    'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
    'Photorealistic': 'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
    'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
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
const aspectRatioDimensions = {
    '16:9': { width: 1360, height: 768 },
    '9:16': { width: 768, height: 1360 },
    '1:1': { width: 1024, height: 1024 },
    '4:3': { width: 1024, height: 768 },
};
const generateThumbnail = async (req, res) => {
    try {
        console.log("Thumbnail generation started");
        const { userId } = req.session;
        const { title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay, } = req.body;
        const thumbnail = await Thumbnail_1.default.create({
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
        let prompt = `Create a ${stylePrompts[style]} for: "${title}"`;
        if (color_scheme) {
            prompt += ` Use a ${colorSchemeDescriptions[color_scheme]} color scheme.`;
        }
        if (user_prompt) {
            prompt += ` Additional details: ${user_prompt}.`;
        }
        prompt +=
            ` The thumbnail should be ${aspect_ratio}, visually stunning, and` +
                ` designed to maximize click-through rate. Make it bold, professional,` +
                ` and impossible to ignore.`;
        const dimensions = aspectRatioDimensions[aspect_ratio] ?? aspectRatioDimensions['16:9'];
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
            throw new Error(`Cloudflare Workers AI error ${cfResponse.status}: ${errText}`);
        }
        const cfJson = await cfResponse.json();
        if (!cfJson.success || !cfJson.result?.image) {
            throw new Error(`Cloudflare Workers AI returned no image. Errors: ${JSON.stringify(cfJson.errors)}`);
        }
        const imageBuffer = Buffer.from(cfJson.result.image, 'base64');
        fs_1.default.mkdirSync('images', { recursive: true });
        const filename = `cf-output-${Date.now()}.png`;
        const filePath = path_1.default.join('images', filename);
        fs_1.default.writeFileSync(filePath, imageBuffer);
        let uploadResult;
        try {
            uploadResult = await cloudinary_1.v2.uploader.upload(filePath, {
                resource_type: 'image',
            });
        }
        catch (uploadErr) {
            console.error("Cloudinary Upload Error:", uploadErr);
            throw new Error(`Cloudinary Upload Failed: ${uploadErr.message}`);
        }
        thumbnail.image_url = uploadResult.url;
        thumbnail.isGenerating = false;
        await thumbnail.save();
        const finalThumbnail = await Thumbnail_1.default.findById(thumbnail._id).lean();
        res.status(200).json({ message: 'Thumbnail Generated', finalThumbnail });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
exports.generateThumbnail = generateThumbnail;
const deleteThumbnail = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.session;
        const result = await Thumbnail_1.default.findOneAndDelete({ _id: id, userId });
        if (!result) {
            return res.status(404).json({ message: "Thumbnail not found or unauthorized" });
        }
        res.json({ message: "Thumbnail deleted successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
exports.deleteThumbnail = deleteThumbnail;
