import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../../config/env";
import type { UserTokenPayload } from "../../types/auth.types";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing",
    });
  }

  const token = authHeader.slice(7).trim();

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    if (typeof decoded !== "object" || decoded === null || !("id" in decoded)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const payload = decoded as UserTokenPayload;

    req.user = {
      id: Number(payload.id),
      name: payload.name,
      role: payload.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authenticate;
