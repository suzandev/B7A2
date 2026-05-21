import { pool } from "../../db";
import type { CreateIssue, Issue } from "../../types/issue.types";

const createIssue = async (payload: CreateIssue & { reporter_id: number }) => {
  const result = await pool.query<Issue>(
    `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      title,
      description,
      type,
      status,
      reporter_id,
      created_at,
      updated_at
    `,
    [payload.title, payload.description, payload.type, payload.reporter_id],
  );

  return result.rows[0];
};

export default {
  createIssue,
};
