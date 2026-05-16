// controllers/root.c.js
export const getSignup = (req, res) => res.render("signup", { title: "Sign up" });
export const getCalculator = (req, res) => res.render("simpleCalculator", { title: "Simple Calculator" });
