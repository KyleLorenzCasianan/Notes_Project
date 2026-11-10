import express from "express";
import {
    createPhoto,
    deletePhoto,
    getPhotoById,
    getPhotos,
    updatePhoto
} from "../controllers/photosController.js";

const router = express.Router();

router.get("/", getPhotos);
router.post("/", createPhoto);
router.get("/:id", getPhotoById);
router.put("/:id", updatePhoto);
router.delete("/:id", deletePhoto);

export default router;
