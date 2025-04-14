import { Router } from "express";
import { createOrder } from "../controllers/order.controller";

export const orderRouter = Router();

orderRouter.post("/:productId", createOrder);
