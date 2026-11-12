import crypto from "node:crypto";
import User from "../models/users.js";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const getAuthSecret = () => {
    if (!process.env.AUTH_SECRET) {
        console.warn("AUTH_SECRET is not set. Set it in backend/.env before deploying.");
    }
    return process.env.AUTH_SECRET || "development-only-auth-secret";
};

const hashPassword = async (password, salt = crypto.randomBytes(16).toString("hex")) => {
    const derivedKey = await new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (error, key) => {
            if (error) reject(error);
            else resolve(key);
        });
    });

    return `${salt}:${derivedKey.toString("hex")}`;
};

const verifyPassword = async (password, storedPassword) => {
    const [salt, storedHash] = storedPassword.split(":");
    if (!salt || !storedHash) return false;

    const derivedKey = await new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (error, key) => {
            if (error) reject(error);
            else resolve(key);
        });
    });

    const expectedHash = Buffer.from(storedHash, "hex");
    return expectedHash.length === derivedKey.length && crypto.timingSafeEqual(expectedHash, derivedKey);
};

const signSession = (userId) => {
    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
    const payload = `${userId}.${expiresAt}`;
    const signature = crypto.createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
    return `${payload}.${signature}`;
};

export const getUserFromSession = async (token) => {
    if (!token) return null;

    const [userId, expiresAt, signature] = token.split(".");
    if (!userId || !expiresAt || !signature || Number(expiresAt) < Math.floor(Date.now() / 1000)) {
        return null;
    }

    const payload = `${userId}.${expiresAt}`;
    const expectedSignature = crypto.createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
    const providedSignature = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
        providedSignature.length !== expectedSignatureBuffer.length ||
        !crypto.timingSafeEqual(providedSignature, expectedSignatureBuffer)
    ) {
        return null;
    }

    return User.findById(userId).select("-password");
};

const setSessionCookie = (res, userId) => {
    res.setHeader(
        "Set-Cookie",
        `pixora_session=${signSession(userId)}; HttpOnly; Path=/; Max-Age=${SESSION_DURATION_SECONDS}; SameSite=Lax`
    );
};

const clearSessionCookie = (res) => {
    res.setHeader("Set-Cookie", "pixora_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
};

const publicUser = (user) => ({
    id: user._id,
    userName: user.userName,
    email: user.email
});

export const register = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        if (!userName?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: "An account with that email already exists" });
        }

        const user = await User.create({
            userName: userName.trim(),
            email: normalizedEmail,
            password: await hashPassword(password)
        });

        setSessionCookie(res, user._id.toString());
        return res.status(201).json({ user: publicUser(user) });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Unable to create account" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email?.trim().toLowerCase() });

        if (!user || !(await verifyPassword(password || "", user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        setSessionCookie(res, user._id.toString());
        return res.json({ user: publicUser(user) });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Unable to log in" });
    }
};

export const me = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }

    return res.json({ user: publicUser(req.user) });
};

export const logout = (req, res) => {
    clearSessionCookie(res);
    return res.json({ message: "Logged out successfully" });
};
