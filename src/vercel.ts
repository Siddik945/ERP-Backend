import { app } from "./app";
import { connectDB } from "./config/db";

let connected = false;

export default async function handler(req: any, res: any) {
  if (!connected) {
    await connectDB();
    connected = true;
  }

  return app(req, res);
}
