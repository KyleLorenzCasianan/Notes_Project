import Folder from "../models/folders.js"

export const getFolders = async (req, res) => {
    try{
        const folders = await Folder.find();
        res.json(folders);
    } catch (error) {
        res.status(500).json ({ message: "Server error" })
    }
}

export const createFolder = async (req, res) => {
    try{
        const { folderName, userId } = req.body;

        if(!folderName || !userId) {
            return res.status(400).json({ message: "Folder name and user ID are required" });
        }

        const newFolder = await Folder.create({ folderName, userId });
        res.status(201).json(newFolder);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const getFolderById = async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        res.json(folder);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const updateFolder = async (req, res) => {
    try {
        const { folderName } = req.body;
        const folder = await Folder.findByIdAndUpdate(
            req.params.id,
            { folderName },
            { new: true }
        );
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        res.json(folder);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const deleteFolder = async (req, res) => {
    try {
        const folder = await Folder.findByIdAndDelete(req.params.id);
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        res.json({ message: "Folder deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}