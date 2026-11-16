import mongoose from "mongoose";

const shareSchema = new mongoose.Schema(
    {
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        resourceType: { type: String, enum: ["photo", "folder"], required: true },
        resourceId: { type: mongoose.Schema.Types.ObjectId, required: true }
    },
    { timestamps: true }
);

shareSchema.index({ ownerId: 1, recipientId: 1, resourceType: 1, resourceId: 1 }, { unique: true });

export default mongoose.model("Share", shareSchema);
