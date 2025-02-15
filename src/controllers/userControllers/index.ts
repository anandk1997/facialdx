import { getUserById } from "./[getUserById]";
import { createUser } from "./createUser";
import { deleteUser } from "./deleteUser";
import { getUsers } from "./getAllUsers";
import { updateUser } from "./updateUser";

export const UserController = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
