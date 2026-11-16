import express from "express";
import { createShare, deleteShare, getShared } from "../controllers/sharesController.js";

const router = express.Router();
router.get("/", getShared);
router.post("/", createShare);
router.delete("/:id", deleteShare);
export default router;
