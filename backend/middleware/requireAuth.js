import { getUserFromSession } from "../controllers/authController.js";

const getCookie = (cookieHeader, name) => {
    const cookie = cookieHeader
        ?.split(";")
        .map((item) => item.trim())
        .find((item) => item.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
};

export const requireAuth = async (req, res, next) => {
    try {
        const token = getCookie(req.headers.cookie, "pixora_session");
        const user = await getUserFromSession(token);

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        req.user = user;
        return next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Authentication required" });
    }
};
