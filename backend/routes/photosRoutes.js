import express from "express";
import {
    createPhoto,
    deletePhoto,
    getPhotoById,
    getPhotos,
    getUploadSignature,
    updatePhoto
} from "../controllers/photosController.js";

const router = express.Router();

router.get("/", getPhotos);
router.get("/upload-signature", getUploadSignature);
router.post("/", createPhoto);
router.get("/:id", getPhotoById);
router.put("/:id", updatePhoto);
router.delete("/:id", deletePhoto);

export default router;
