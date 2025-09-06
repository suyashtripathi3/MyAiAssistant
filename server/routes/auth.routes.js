import express from "express";
import { signin, logout, signup } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.get("/logout", logout);

export default authRouter;
