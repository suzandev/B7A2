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

export interface UserTokenPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
  iat?: number;
  exp?: number;
}
