import express from "express";
import photoRoutes from "./routes/photosRoutes.js";
import folderRoutes from "./routes/foldersRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import connectionsRoutes from "./routes/connectionsRoutes.js";
import sharesRoutes from "./routes/sharesRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import trashRoutes from "./routes/trashRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { connectDB } from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(express.json());
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    return next();
});

app.use("/api/auth", authRoutes);
app.use("/api/photos", requireAuth, photoRoutes);
app.use("/api/folders", requireAuth, folderRoutes);
app.use("/api/users", requireAuth, usersRoutes);
app.use("/api/connections", requireAuth, connectionsRoutes);
app.use("/api/shares", requireAuth, sharesRoutes);
app.use("/api/notifications", requireAuth, notificationsRoutes);
app.use("/api/trash", requireAuth, trashRoutes);


app.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
});