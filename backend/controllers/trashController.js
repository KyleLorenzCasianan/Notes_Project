import Photo from "../models/photos.js";
import { getCloudinary } from "../config/cloudinary.js";

export const getTrash = async (req, res) => {
    const expiredPhotos = await Photo.find({
        userId: req.user._id,
        purgeAt: { $lte: new Date() }
    });
    for (const photo of expiredPhotos) {
        await getCloudinary().uploader.destroy(photo.publicId);
        await photo.deleteOne();
    }
    const photos = await Photo.find({ userId: req.user._id, deletedAt: { $ne: null } }).sort({ deletedAt: -1 });
    return res.json(photos);
};

export const restorePhoto = async (req, res) => {
    const photo = await Photo.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id, deletedAt: { $ne: null } },
        { $unset: { deletedAt: 1, purgeAt: 1 } },
        { new: true }
    );
    if (!photo) return res.status(404).json({ message: "Trashed photo not found" });
    return res.json(photo);
};

export const permanentlyDeletePhoto = async (req, res) => {
    const photo = await Photo.findOneAndDelete({ _id: req.params.id, userId: req.user._id, deletedAt: { $ne: null } });
    if (!photo) return res.status(404).json({ message: "Trashed photo not found" });
    await getCloudinary().uploader.destroy(photo.publicId);
    return res.json({ message: "Photo permanently deleted" });
};
