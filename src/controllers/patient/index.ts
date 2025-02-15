import { getPatientDetails } from "./patientDetails/[getPatientDetails]";
import { getPatientDetailsAdmin } from "./patientDetails/[getPatientDetailsAdmin]";
import { addAdminComments } from "./addAdminComments";
import { addPatientDetails } from "./addPatientDetails";
import { getAllPatientsByUserID } from "./getAllPatientsByUserID";

export const Patient = {
  getAllPatientsByUserID,
  addPatientDetails,
  getPatientDetails,
  addAdminComments,
  getPatientDetailsAdmin,
};
