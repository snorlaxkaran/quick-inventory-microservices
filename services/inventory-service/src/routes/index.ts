import { Router } from "express";
import invetoryRoutes from "./inventoryService";

const router = Router();

router.use("/inventory", invetoryRoutes);

export default router;
