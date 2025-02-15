import express from "express";

import { PredictionController } from "../controllers/prediction";
import { authenticateToken } from "../middlewares/auth";
import multer from "multer";

const router = express.Router();

router.use(authenticateToken);

const upload = multer({ dest: "uploads/" });

router
  .route("/predictions")
  .get(PredictionController.getPredictions)
  .post(PredictionController.uploadImages);

router
  .route("/upload")
  .post(upload.array("files", 5), PredictionController.uploadImages);

router
  .route("/predictions/:id/:image_id")
  .get(PredictionController.getPredictionById);

router
  .route("/prediction/history/:id")
  .get(PredictionController.getPredictionHistory);

export { router as predictionRoutes };
