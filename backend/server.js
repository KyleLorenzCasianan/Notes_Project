import express from "express";
import photoRoutes from "./routes/photosRoutes.js";
// import folderRoutes from "./routes/foldersRoutes.js";
import { connectDB } from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(express.json());
app.use("/api/photos", photoRoutes);
// app.use("/api/folders", folderRoutes);


app.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
});