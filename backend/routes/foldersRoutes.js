import express from "express";
import { getFolders, createFolder, deleteFolder, updateFolder, getFolderById } from "../controllers/foldersController.js";

const router = express.Router();

router.get("/", getFolders);
router.post("/", createFolder);
router.get("/:id", getFolderById);
router.put("/:id", updateFolder);
router.delete("/:id", deleteFolder);

export default router;