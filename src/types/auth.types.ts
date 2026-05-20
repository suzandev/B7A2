export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
}

export interface LoginRequest {
  email: string;
  password: string;
}
