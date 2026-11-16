import User from "../models/users.js";

export const searchUsers = async (req, res) => {
    try {
        const query = req.query.q?.trim();
        if (!query || query.length < 2) return res.json([]);

        const expression = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        const users = await User.find({
            _id: { $ne: req.user._id },
            $or: [{ userName: expression }, { email: expression }]
        }).select("_id userName email").limit(20);

        return res.json(users);
    } catch (error) {
        console.error("User search error:", error);
        return res.status(500).json({ message: "Unable to search users" });
    }
};
