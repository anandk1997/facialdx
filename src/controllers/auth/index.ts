import { changePassword } from "./changePassword";
import { forgotPassword } from "./resetPassword/forgotPassword";
import { login } from "./login";
import { validateOtpAndResetPassword } from "./resetPassword/resetPassword";
import { logout } from "./logout";

export const AuthController = {
  login,
  changePassword,
  forgotPassword,
  validateOtpAndResetPassword,
  logout,
};
