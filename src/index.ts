import app from "./app";
import config from "./config/env";
import { initDB } from "./db";

const main = async () => {
  try {
    await initDB();
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1);
  }
};

main();
