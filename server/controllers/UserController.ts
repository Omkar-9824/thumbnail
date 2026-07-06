import { Request, Response } from "express"
import Thumbnail from "../models/Thumbnail";
import { create } from "node:domain";

export const getUsersThumbnails = async (req: Request, res: Response) => {
    try {
        const {userId}=req.session;

        const thumbnail=await Thumbnail.find({userId}).sort({createdAt:-1})
        res.json({thumbnail})
    } catch (error:any) {
        console.log(error);
        res.status(500).json({message:error.message});
    }
}

export const getThumbnailbyId = async (req: Request, res: Response) => {
    try {
        const {userId}=req.session;
        const {id}=req.params;

        const thumbnail=await Thumbnail.findOne({userId,_id:id});
        if (!thumbnail) {
            return res.status(404).json({ message: "Thumbnail not found" });
        }
        res.json({thumbnail});


        
    } catch (error:any) {
        console.log(error);
        res.status(500).json({message:error.message});
    }
}