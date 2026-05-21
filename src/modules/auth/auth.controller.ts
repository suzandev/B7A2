import type { Request, Response } from "express";
import authService from "./auth.service";

const signup = async (req: Request, res: Response) => {
  const result = await authService.signupUser(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
};

const login = async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

export default {
  signup,
  login,
};
