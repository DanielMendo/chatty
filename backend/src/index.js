import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import connectDB from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const port = process.env.PORT
const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : false,
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("*", (req, res, next) => {
        const isApi = req.path.startsWith("/api/");
        const isStatic = req.path.includes(".");
        if (isApi || isStatic) return next();
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
}

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    connectDB();
});
