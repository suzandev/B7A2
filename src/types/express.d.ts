import type { UserTokenPayload } from "./auth.types";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserTokenPayload;
  }
}
