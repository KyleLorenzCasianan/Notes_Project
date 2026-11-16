import Folder from "../models/folders.js";
import Photo from "../models/photos.js";

export const getFolders = async (req, res) => {
    try{
        const folders = await Folder.find({ userId: req.user._id }).sort({ folderName: 1 });
        res.json(folders);
    } catch (error) {
        console.error("Error fetching folders:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const createFolder = async (req, res) => {
    try{
        const { folderName } = req.body;

        if(!folderName?.trim()) {
            return res.status(400).json({ message: "Folder name is required" });
        }

        const newFolder = await Folder.create({ folderName: folderName.trim(), userId: req.user._id });
        res.status(201).json(newFolder);
    } catch (error) {
        console.error("Error creating folder:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getFolderById = async (req, res) => {
    try {
        const folder = await Folder.findOne({ _id: req.params.id, userId: req.user._id });
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        res.json(folder);
    } catch (error) {
        console.error("Error fetching folder:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const updateFolder = async (req, res) => {
    try {
        const { folderName } = req.body;
        if (!folderName?.trim()) {
            return res.status(400).json({ message: "Folder name is required" });
        }
        const folder = await Folder.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { folderName: folderName?.trim() },
            { new: true }
        );
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        res.json(folder);
    } catch (error) {
        console.error("Error updating folder:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const deleteFolder = async (req, res) => {
    try {
        const folder = await Folder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        await Photo.updateMany({ userId: req.user._id, folderId: folder._id }, { $unset: { folderId: 1 } });
        res.json({ message: "Folder deleted successfully" });
    } catch (error) {
        console.error("Error deleting folder:", error);
        res.status(500).json({ message: "Server error" });
    }
}