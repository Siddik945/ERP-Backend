import { createServer } from "node:http";

import { app } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { initializeSocket } from "./realtime/socket";

const httpServer = createServer(app);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    initializeSocket(httpServer);

    httpServer.listen(env.port, () => {
      console.log(`HTTP API running on http://localhost:${env.port}`);
      console.log(`Socket.IO running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = (signal: string): void => {
  console.log(`${signal} received. Shutting down server...`);

  httpServer.close((error) => {
    if (error) {
      console.error("Failed to close server:", error);
      process.exit(1);
    }

    console.log("HTTP and Socket.IO server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

void startServer();
