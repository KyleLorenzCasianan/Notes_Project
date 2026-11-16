import Folder from "../models/folders.js";
import Notification from "../models/notifications.js";
import Photo from "../models/photos.js";
import Share from "../models/shares.js";
import User from "../models/users.js";

export const getShared = async (req, res) => {
    try {
        const shares = await Share.find({ recipientId: req.user._id })
            .populate("ownerId", "userName email")
            .sort({ createdAt: -1 });
        const results = [];
        for (const share of shares) {
            const resource = share.resourceType === "photo"
                ? await Photo.findOne({ _id: share.resourceId, deletedAt: null })
                : await Folder.findOne({ _id: share.resourceId, deletedAt: null });
            if (resource) {
                const photos = share.resourceType === "folder"
                    ? await Photo.find({ folderId: resource._id, userId: share.ownerId, deletedAt: null }).sort({ createdAt: -1 })
                    : undefined;
                results.push({ ...share.toObject(), resource, photos });
            }
        }
        return res.json(results);
    } catch (error) {
        console.error("Shared content error:", error);
        return res.status(500).json({ message: "Unable to fetch shared content" });
    }
};

export const createShare = async (req, res) => {
    try {
        const { resourceType, resourceId, recipientId } = req.body;
        if (!["photo", "folder"].includes(resourceType)) {
            return res.status(400).json({ message: "Invalid resource type" });
        }

        const recipient = await User.findById(recipientId).select("userName email");
        const resource = resourceType === "photo"
            ? await Photo.findOne({ _id: resourceId, userId: req.user._id, deletedAt: null })
            : await Folder.findOne({ _id: resourceId, userId: req.user._id, deletedAt: null });
        if (!recipient || recipient._id.equals(req.user._id) || !resource) {
            return res.status(400).json({ message: "Valid recipient and resource are required" });
        }

        const share = await Share.create({ ownerId: req.user._id, recipientId, resourceType, resourceId });
        await Notification.create({
            recipientId,
            actorId: req.user._id,
            type: "share",
            message: `${req.user.userName} shared a ${resourceType} with you`,
            resourceType,
            resourceId: resource._id
        });
        return res.status(201).json(share);
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: "This item is already shared with that user" });
        console.error("Share creation error:", error);
        return res.status(500).json({ message: "Unable to share item" });
    }
};

export const deleteShare = async (req, res) => {
    const share = await Share.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!share) return res.status(404).json({ message: "Share not found" });
    return res.json({ message: "Share revoked" });
};
