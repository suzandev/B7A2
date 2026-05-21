import { Router } from "express";
import issueController from "./issue.controller";
import authenticate from "../auth/auth.middleware";

const router = Router();

router.post("/", authenticate, issueController.createIssue);
router.get("/", issueController.getIssues);
router.get("/:id", issueController.getIssue);
router.patch("/:id", authenticate, issueController.updateIssue);
router.delete("/:id", authenticate, issueController.deleteIssue);

export const issueRoute = router;
