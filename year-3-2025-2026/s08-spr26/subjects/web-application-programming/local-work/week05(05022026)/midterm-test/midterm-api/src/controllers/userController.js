import * as userService from "../services/userService.js";

export async function signup(req, res, next) {
  try {
    const user = await userService.signup(req.body);
    return res.created(user);
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await userService.login(req.body);
    return res.ok(result);
  } catch (err) {
    return next(err);
  }
}
