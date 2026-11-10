import Photo from "../models/photos.js";

export const getPhotos = async (req, res) => {
    try {
        const photos = await Photo.find();
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
        const photo = await Photo.findById(req.params.id);
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
        const photo = await Photo.findByIdAndUpdate(
            req.params.id,
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
        const photo = await Photo.findByIdAndDelete(req.params.id);
        if (!photo) {
            return res.status(404).json({ message: "Photo not found" });
        }
        res.json({ message: "Photo deleted successfully" });
    } catch (error) {
        console.error("Error deleting photo:", error);
        res.status(500).json({ message: "Server error" });
    }
};
