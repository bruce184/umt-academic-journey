import { createUser, verifyLogin } from "../services/userService.js";
import { signAccessToken } from "../services/tokenService.js";

export function signup(req, res) {
  try {
    const user = createUser(req.body);
    return res.created(user);
  } catch (err) {
    return res.error(err);
  }
}

export function login(req, res) {
  try {
    const user = verifyLogin(req.body);
    const accessToken = signAccessToken({ userId: user.id, email: user.email });

    return res.ok({ accessToken, tokenType: "Bearer" });
  } catch (err) {
    return res.error(err);
  }
}
