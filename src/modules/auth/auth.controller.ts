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
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const result = await authService.loginUser({ email, password });

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
