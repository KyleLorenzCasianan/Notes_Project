import Photo from "../models/photos.js";
import { getCloudinary } from "../config/cloudinary.js";

export const getPhotos = async (req, res) => {
    try {
        const photos = await Photo.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(photos);
    } catch (error) {
        console.error("Error fetching photos:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createPhoto = async (req, res) => {
    try {
        const { title, imageUrl, publicId, folderId, width, height, format, size } = req.body;

        if (!title || !imageUrl || !publicId) {
            return res.status(400).json({ message: "Title, image URL, and public ID are required" });
        }

        const photo = await Photo.create({
            userId: req.user._id,
            title,
            imageUrl,
            publicId,
            folderId,
            width,
            height,
            format,
            size
        });

        res.status(201).json(photo);
    } catch (error) {
        console.error("Error creating photo:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPhotoById = async (req, res) => {
    try {
        const photo = await Photo.findOne({ _id: req.params.id, userId: req.user._id });
        if (!photo) {
            return res.status(404).json({ message: "Photo not found" });
        }
        res.json(photo);
    } catch (error) {
        console.error("Error fetching photo:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updatePhoto = async (req, res) => {
    try {
        const { title, folderId } = req.body;
        const photo = await Photo.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { title, folderId },
            { new: true, runValidators: true }
        );

        if (!photo) {
            return res.status(404).json({ message: "Photo not found" });
        }
        res.json(photo);
    } catch (error) {
        console.error("Error updating photo:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!photo) {
            return res.status(404).json({ message: "Photo not found" });
        }

        await getCloudinary().uploader.destroy(photo.publicId);
        res.json({ message: "Photo deleted successfully" });
    } catch (error) {
        console.error("Error deleting photo:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUploadSignature = (req, res) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `pixora/${req.user._id}`;
    const signature = getCloudinary().utils.api_sign_request({ folder, timestamp }, process.env.CLOUDINARY_API_SECRET);

    res.json({
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
        signature,
        timestamp
    });
};
