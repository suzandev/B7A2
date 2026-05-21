import type { Request, Response } from "express";
import issueService from "./issue.service";
import type { CreateIssue } from "../../types/issue.types";

const createIssue = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const payload: CreateIssue = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
  };

  const issue = await issueService.createIssue({
    ...payload,
    reporter_id: user.id,
  });

  return res.status(201).json({
    success: true,
    message: "Issue created successfully",
    data: issue,
  });
};

const getIssues = async (req: Request, res: Response) => {
  const sort = req.query.sort === "oldest" ? "oldest" : "newest";
  const type =
    req.query.type === "bug" || req.query.type === "feature_request"
      ? req.query.type
      : undefined;
  const status =
    req.query.status === "open" ||
    req.query.status === "in_progress" ||
    req.query.status === "resolved"
      ? req.query.status
      : undefined;

  const filters: import("../../types/issue.types").GetIssuesFilters = {
    sort,
  };

  if (type) {
    filters.type = type;
  }

  if (status) {
    filters.status = status;
  }

  const issues = await issueService.getIssues(filters);

  return res.status(200).json({
    success: true,
    data: issues,
  });
};

export default {
  createIssue,
  getIssues,
};
