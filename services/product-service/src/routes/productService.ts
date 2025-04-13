import { Router } from "express";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../controllers/product.controller";

const productRoutes = Router();

productRoutes.get("/", getAllProducts);
productRoutes.get("/:id", getProduct);
productRoutes.post("/", createProduct);
productRoutes.patch("/:id", updateProduct);
productRoutes.delete("/:id", deleteProduct);

export default productRoutes;
