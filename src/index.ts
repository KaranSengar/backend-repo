import "reflect-metadata";
import { app } from "./app";
import { appConfig } from "./config/index";
import logger from "./config/logger";
import { AppDataSource } from "./data-source";

async function startServer() {
  try {
    // 1️⃣ DB initialize first (IMPORTANT)
    await AppDataSource.initialize();
    //logger.info("✅ Data Source initialized");

    // 2️⃣ Start server only after DB is ready
    const Port = appConfig.PORT;

    app.listen(Port, () => {
      logger.info(`🚀 Server is running on port ${Port}`);
      // console.log(Port)
    });
  } catch (err) {
    logger.error("❌ Failed to start server", err);
    process.exit(1);
  }
}

startServer();
