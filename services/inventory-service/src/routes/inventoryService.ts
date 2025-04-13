import { Router } from "express";
import {
  decreaseInventory,
  getAllInventory,
  getInventory,
  increaseInventory,
} from "../controllers/inventory.controller";

const invetoryRoutes = Router();

invetoryRoutes.get("/", getAllInventory);
invetoryRoutes.get("/:productId", getInventory);
invetoryRoutes.patch("/:productId/increase", increaseInventory);
invetoryRoutes.patch("/:productId/decrease", decreaseInventory);

export default invetoryRoutes;
