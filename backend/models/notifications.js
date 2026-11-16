import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["connection_request", "connection_accepted", "share"], required: true },
        message: { type: String, required: true },
        resourceType: String,
        resourceId: mongoose.Schema.Types.ObjectId,
        connectionId: mongoose.Schema.Types.ObjectId,
        readAt: Date
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
