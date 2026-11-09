import express from "express";
// import noteRoutes from "./routes/notesRoutes.js";
// import folderRoutes from "./routes/foldersRoutes.js";
import { connectDB } from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(express.json());
// app.use("/api/notes", noteRoutes);
// app.use("/api/folders", folderRoutes);

app.get("/api/notes", (req, res) => {
  res.json({ message: "Hello, World!" });
});


app.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
});