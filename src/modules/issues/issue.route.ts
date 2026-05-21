import { Router } from "express";
import issueController from "./issue.controller";
import authenticate from "../auth/auth.middleware";

const router = Router();

router.post("/", authenticate, issueController.createIssue);
router.get("/", issueController.getIssues);

export const issueRoute = router;
