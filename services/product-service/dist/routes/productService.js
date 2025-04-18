"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const productRoutes = (0, express_1.Router)();
productRoutes.get("/", product_controller_1.getAllProducts);
productRoutes.get("/:id", product_controller_1.getProduct);
productRoutes.post("/", product_controller_1.createProduct);
productRoutes.patch("/:id", product_controller_1.updateProduct);
productRoutes.delete("/:id", product_controller_1.deleteProduct);
exports.default = productRoutes;
