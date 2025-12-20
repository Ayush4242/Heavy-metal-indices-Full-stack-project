import express from "express";
import {
  addPollution,
  getMyPollution,
  getLocationPLI,
} from "../controllers/pollutionController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/add", protect, addPollution);


router.get("/my", protect, getMyPollution);


router.get("/location-pli", protect, getLocationPLI);

export default router;
