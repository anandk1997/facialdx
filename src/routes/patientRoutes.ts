import express from "express";

import { authenticateToken, isAdmin } from "../middlewares/auth";
import { Patient } from "../controllers/patient";
import { getAllPatients } from "../controllers/patient/getAllPatients";

const router = express.Router();

router.use(authenticateToken);

router
  .route("/patients")
  .get(isAdmin, getAllPatients)
  .post(Patient.addPatientDetails);

router.route("/patients/:id").get(Patient.getAllPatientsByUserID);
router
  .route("/patients/admin_comment")
  .patch(isAdmin, Patient.addAdminComments);

router.route("/patient/:id/:image_id").get(Patient.getPatientDetails);
router.route("/patientdetails/:image_id").get(Patient.getPatientDetailsAdmin);

export { router as patientRoutes };
