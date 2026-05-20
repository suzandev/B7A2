import dotenv from "dotenv";
import { env } from "process";

dotenv.config({ quiet: true });

const config = {
  port: Number(env.PORT) || 3000,
};

export default config;
