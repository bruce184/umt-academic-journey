import * as userService from '../services/user-s.js';

export const signup = async (req, res, next) => {
  try {
    const { user, token } = await userService.signup(req.body);
    res.created({ user, token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);
    res.ok({ user, token });
  } catch (err) {
    next(err);
  }
};
