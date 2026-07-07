import { Server as HttpServer } from "node:http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { env } from "../config/env";

export type SaleCreatedPayload = {
  saleId: string;
  customerId: string;
  grandTotal: number;
  createdAt: string;
};

export type LowStockProductPayload = {
  productId: string;
  productName: string;
  sku: string;
  stockQuantity: number;
};

export type LowStockPayload = {
  products: LowStockProductPayload[];
  createdAt: string;
};

interface ServerToClientEvents {
  "socket:ready": (payload: { connected: boolean; userId: string }) => void;

  "sale:created": (payload: SaleCreatedPayload) => void;

  "stock:low": (payload: LowStockPayload) => void;
}

interface ClientToServerEvents {
  "socket:ping": (
    callback: (response: { success: boolean; time: string }) => void,
  ) => void;
}

interface InterServerEvents {}

interface SocketData {
  userId: string;
  role?: string;
}

type AuthenticatedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type SocketJwtPayload = JwtPayload & {
  id?: string;
  userId?: string;
  role?: string;
};

type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: SocketServer | null = null;

const getTokenFromSocket = (socket: AuthenticatedSocket): string | null => {
  const authToken = socket.handshake.auth?.token;

  if (typeof authToken === "string" && authToken.trim()) {
    return authToken;
  }

  const authorizationHeader = socket.handshake.headers.authorization;

  if (
    typeof authorizationHeader === "string" &&
    authorizationHeader.startsWith("Bearer ")
  ) {
    return authorizationHeader.substring(7);
  }

  return null;
};

const authenticateSocket = (
  socket: AuthenticatedSocket,
  next: (error?: Error) => void,
) => {
  try {
    const token = getTokenFromSocket(socket);

    if (!token) {
      return next(new Error("Authentication token is required"));
    }

    const decoded = jwt.verify(token, env.jwtSecret) as SocketJwtPayload;

    const userId =
      decoded.userId ||
      decoded.id ||
      (typeof decoded.sub === "string" ? decoded.sub : undefined);

    if (!userId) {
      return next(new Error("Invalid authentication token payload"));
    }

    socket.data.userId = userId;
    socket.data.role = decoded.role;

    next();
  } catch {
    next(new Error("Invalid or expired authentication token"));
  }
};

export const initializeSocket = (httpServer: HttpServer): SocketServer => {
  const allowedOrigins = Array.from(
    new Set(
      ["http://localhost:5173", env.clientUrl].filter(
        (origin): origin is string =>
          typeof origin === "string" && Boolean(origin),
      ),
    ),
  );

  io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },

    transports: ["websocket", "polling"],

    pingTimeout: 60_000,
    pingInterval: 25_000,
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const { userId, role } = socket.data;

    socket.join(`user:${userId}`);

    if (role) {
      socket.join(`role:${role.toLowerCase()}`);
    }

    socket.emit("socket:ready", {
      connected: true,
      userId,
    });

    socket.on("socket:ping", (callback) => {
      callback({
        success: true,
        time: new Date().toISOString(),
      });
    });

    socket.on("disconnect", (reason) => {
      //   console.log(`Socket disconnected: ${socket.id}; reason: ${reason}`);
    });
  });

  io.engine.on("connection_error", (error) => {
    console.error("Socket.IO connection error:", {
      code: error.code,
      message: error.message,
    });
  });

  return io;
};

export const emitSaleCreated = (payload: SaleCreatedPayload): void => {
  io?.emit("sale:created", payload);
};

export const emitLowStock = (payload: LowStockPayload): void => {
  if (!payload.products.length) return;

  io?.emit("stock:low", payload);
};

export const getSocketServer = (): SocketServer | null => io;
