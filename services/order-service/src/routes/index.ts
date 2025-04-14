import { Router } from "express";
import { orderRouter } from "./order-services";

export const router = Router();

router.use("/order", orderRouter);
