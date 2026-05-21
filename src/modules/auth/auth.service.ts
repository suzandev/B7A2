import bcrypt from "bcrypt";
import { pool } from "../../db";
import jwt from "jsonwebtoken";
import config from "../../config/env";
import type { LoginRequest, SignupRequest } from "../../types/auth.types";

const signupUser = async (payload: SignupRequest) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      name,
      email,
      role,
      created_at,
      updated_at
    `,
    [
      payload.name,
      payload.email,
      hashedPassword,
      payload.role || "contributor",
    ],
  );

  return result.rows[0];
};
const loginUser = async (payload: LoginRequest) => {
  if (!payload.email || !payload.password) {
    throw new Error("Email and password are required");
  }

  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    payload.email,
  ]);
  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(payload.password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: "7d" },
  );

  delete user.password;

  return {
    token,
    user,
  };
};

export default {
  signupUser,
  loginUser,
};
