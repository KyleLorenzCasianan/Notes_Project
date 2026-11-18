import express from "express";
import { cancelConnection, createConnection, deleteConnection, getConnections, updateConnection } from "../controllers/connectionsController.js";

const router = express.Router();
router.get("/", getConnections);
router.post("/", createConnection);
router.patch("/:id", updateConnection);
router.delete("/:id/cancel", cancelConnection);
router.delete("/:id", deleteConnection);
export default router;
