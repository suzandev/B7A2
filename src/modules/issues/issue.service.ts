import { pool } from "../../db";
import type {
  CreateIssue,
  GetIssuesFilters,
  Issue,
  IssueWithReporter,
} from "../../types/issue.types";

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

const getIssues = async (filters: GetIssuesFilters = {}) => {
  const whereClauses: string[] = [];
  const values: Array<string> = [];

  if (filters.type) {
    values.push(filters.type);
    whereClauses.push(`type = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    whereClauses.push(`status = $${values.length}`);
  }

  const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const orderDirection = filters.sort === "oldest" ? "ASC" : "DESC";

  const issueResult = await pool.query<Issue>(
    `
    SELECT
      id,
      title,
      description,
      type,
      status,
      reporter_id,
      created_at,
      updated_at
    FROM issues
    ${where}
    ORDER BY created_at ${orderDirection}
    `,
    values,
  );

  const issues = issueResult.rows;

  if (issues.length === 0) {
    return [];
  }

  const reporterIds = Array.from(new Set(issues.map((issue) => issue.reporter_id)));
  const reporterResult = await pool.query<{
    id: number;
    name: string;
    role: "contributor" | "maintainer";
  }>(
    `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1)
    `,
    [reporterIds],
  );

  const reportersById = new Map(reporterResult.rows.map((reporter) => [reporter.id, reporter]));

  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reportersById.get(issue.reporter_id) ?? {
      id: issue.reporter_id,
      name: "Unknown",
      role: "contributor",
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));
};

export default {
  createIssue,
  getIssues,
};
