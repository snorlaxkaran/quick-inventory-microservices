"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const invetoryRoutes = (0, express_1.Router)();
invetoryRoutes.get("/", inventory_controller_1.getAllInventory);
invetoryRoutes.get("/:productId", inventory_controller_1.getInventory);
invetoryRoutes.patch("/:productId/increase", inventory_controller_1.increaseInventory);
invetoryRoutes.patch("/:productId/decrease", inventory_controller_1.decreaseInventory);
exports.default = invetoryRoutes;
