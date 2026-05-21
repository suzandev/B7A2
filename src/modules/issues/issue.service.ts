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

const getIssueById = async (id: number) => {
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
    WHERE id = $1
    `,
    [id],
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    return null;
  }

  const reporterResult = await pool.query<{
    id: number;
    name: string;
    role: "contributor" | "maintainer";
  }>(
    `
    SELECT id, name, role
    FROM users
    WHERE id = $1
    `,
    [issue.reporter_id],
  );

  const reporter = reporterResult.rows[0] ?? {
    id: issue.reporter_id,
    name: "Unknown",
    role: "contributor",
  };

  const result: IssueWithReporter = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };

  return result;
};

const updateIssue = async (id: number, payload: Partial<CreateIssue>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (payload.title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(payload.title);
  }

  if (payload.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(payload.description);
  }

  if (payload.type !== undefined) {
    fields.push(`type = $${idx++}`);
    values.push(payload.type);
  }

  if (fields.length === 0) {
    return getIssueById(id);
  }

  values.push(id);

  const q = `UPDATE issues SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id`;

  await pool.query(q, values);

  return getIssueById(id);
};

export default {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
};
