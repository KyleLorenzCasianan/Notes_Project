import express from "express";
import { getTrash, permanentlyDeletePhoto, restorePhoto } from "../controllers/trashController.js";

const router = express.Router();
router.get("/", getTrash);
router.post("/photos/:id/restore", restorePhoto);
router.delete("/photos/:id", permanentlyDeletePhoto);
export default router;
