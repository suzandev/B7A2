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

export default {
  createIssue,
};
