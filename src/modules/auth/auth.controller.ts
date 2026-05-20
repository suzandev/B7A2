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

export default {
  signup,
};
