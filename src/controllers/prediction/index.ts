import { getPredictionById } from "./[getPredictionById]";
import { getPredictionHistory } from "./[getPredictionHistory]";
import { getPredictions } from "./getAllPredictions";
import { uploadImages } from "./uploadImage";

export const PredictionController = {
  getPredictions,
  getPredictionById,
  getPredictionHistory,
  uploadImages,
};
