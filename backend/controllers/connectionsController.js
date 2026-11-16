import Connection from "../models/connections.js";
import Notification from "../models/notifications.js";
import User from "../models/users.js";

const userFields = "userName email";

export const getConnections = async (req, res) => {
    try {
        const connections = await Connection.find({
            $or: [{ requesterId: req.user._id }, { recipientId: req.user._id }]
        }).populate("requesterId recipientId", userFields).sort({ createdAt: -1 });
        return res.json(connections);
    } catch (error) {
        console.error("Connection fetch error:", error);
        return res.status(500).json({ message: "Unable to fetch connections" });
    }
};

export const createConnection = async (req, res) => {
    try {
        const { userId } = req.body;
        const recipient = await User.findById(userId).select("userName email");
        if (!recipient || recipient._id.equals(req.user._id)) {
            return res.status(400).json({ message: "Valid recipient is required" });
        }

        const existing = await Connection.findOne({
            $or: [
                { requesterId: req.user._id, recipientId: recipient._id },
                { requesterId: recipient._id, recipientId: req.user._id }
            ]
        });
        if (existing) return res.status(409).json({ message: "A connection already exists" });

        const connection = await Connection.create({ requesterId: req.user._id, recipientId: recipient._id });
        await Notification.create({
            recipientId: recipient._id,
            actorId: req.user._id,
            type: "connection_request",
            message: `${req.user.userName} sent you a connection request`,
            connectionId: connection._id
        });
        return res.status(201).json(await connection.populate("requesterId recipientId", userFields));
    } catch (error) {
        console.error("Connection creation error:", error);
        return res.status(500).json({ message: "Unable to send connection request" });
    }
};

export const updateConnection = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["accepted", "declined", "blocked"].includes(status)) {
            return res.status(400).json({ message: "Invalid connection status" });
        }

        const connection = await Connection.findOne({
            _id: req.params.id,
            recipientId: req.user._id
        }).populate("requesterId recipientId", userFields);
        if (!connection) return res.status(404).json({ message: "Connection request not found" });

        connection.status = status;
        if (status === "accepted") connection.acceptedAt = new Date();
        await connection.save();

        if (status === "accepted") {
            await Notification.create({
                recipientId: connection.requesterId._id,
                actorId: req.user._id,
                type: "connection_accepted",
                message: `${req.user.userName} accepted your connection request`,
                connectionId: connection._id
            });
        }
        return res.json(connection);
    } catch (error) {
        console.error("Connection update error:", error);
        return res.status(500).json({ message: "Unable to update connection" });
    }
};

export const deleteConnection = async (req, res) => {
    const connection = await Connection.findOneAndDelete({
        _id: req.params.id,
        $or: [{ requesterId: req.user._id }, { recipientId: req.user._id }]
    });
    if (!connection) return res.status(404).json({ message: "Connection not found" });
    return res.json({ message: "Connection removed" });
};
