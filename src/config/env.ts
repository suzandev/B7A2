import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.CONNECTION_STRING;
const port = Number(process.env.PORT) || 3000;

if (!connectionString) {
  throw new Error("Missing CONNECTION_STRING environment variable");
}

export default {
  connectionString,
  port,
};
