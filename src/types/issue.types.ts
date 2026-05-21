export interface CreateIssue {
  title: string;
  description: string;
  type: "bug" | "feature_request";
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  type?: "bug" | "feature_request";
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

export interface IssueReporter {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

export interface IssueWithReporter {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter: IssueReporter;
  created_at: string;
  updated_at: string;
}

export interface GetIssuesFilters {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}
