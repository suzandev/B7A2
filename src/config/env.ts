import dotenv from "dotenv";

dotenv.config();

const connectionString: string = process.env.CONNECTION_STRING!;
const jwtSecret: string = process.env.JWT_SECRET!;
const port = Number(process.env.PORT) || 3000;

if (!connectionString) {
  throw new Error("Missing CONNECTION_STRING environment variable");
}

if (!jwtSecret) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export default {
  connectionString,
  jwtSecret,
  port,
};
