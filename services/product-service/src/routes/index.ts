import { Router } from "express";
import productRoutes from "./productService";

const router = Router();

router.use("/products", productRoutes);

export default router;
