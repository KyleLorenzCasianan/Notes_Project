import Notification from "../models/notifications.js";

export const getNotifications = async (req, res) => {
    const notifications = await Notification.find({ recipientId: req.user._id })
        .populate("actorId", "userName email")
        .sort({ createdAt: -1 })
        .limit(50);
    return res.json(notifications);
};

export const markNotificationRead = async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipientId: req.user._id },
        { readAt: new Date() },
        { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.json(notification);
};

export const markAllNotificationsRead = async (req, res) => {
    await Notification.updateMany({ recipientId: req.user._id, readAt: null }, { readAt: new Date() });
    return res.json({ message: "Notifications marked as read" });
};
