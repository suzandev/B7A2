import bcrypt from "bcrypt";
import { pool } from "../../db";
import type { SignupRequest } from "../../types/auth.types";

const signupUser = async (payload: SignupRequest) => {
  // Hash password
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

export default {
  signupUser,
};
