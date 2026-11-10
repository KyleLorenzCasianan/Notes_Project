import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true
        },
        publicId: {
            type: String,
            required: true,
            trim: true
        },
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder"
        },
        width: Number,
        height: Number,
        format: String,
        size: Number
    },
    { timestamps: true }
);

const Photo = mongoose.model("Photo", PhotoSchema);

export default Photo;
