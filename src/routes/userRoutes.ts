import express from "express";

import { UserController } from "../controllers/userControllers";
import { authenticateToken } from "../middlewares/auth";

const router = express.Router();

router.use(authenticateToken);

router
  .route("/users")
  .get(UserController.getUsers)
  .post(UserController.createUser);

router
  .route("/users/:id")
  .get(UserController.getUserById)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

export default router;
