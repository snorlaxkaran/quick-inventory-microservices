"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getAllProducts = exports.generateSKU = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const generateSKU = (productName) => {
    const prefix = productName.replace(/\s+/g, "-").toUpperCase().slice(0, 5);
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
    return `${prefix}-${random}`;
};
exports.generateSKU = generateSKU;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allProducts = yield prisma.product.findMany();
    res.json({
        data: allProducts,
    });
});
exports.getAllProducts = getAllProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const existingProduct = yield prisma.product.findFirst({
        where: { id: parseInt(id) },
    });
    if (!existingProduct) {
        res.json({ message: "There is no product with such id" });
        return;
    }
    res.json({
        data: existingProduct,
    });
});
exports.getProduct = getProduct;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price } = req.body;
    if (!name || !price) {
        res.status(400).json({ message: "Please provide all the required field" });
        return;
    }
    const sku = (0, exports.generateSKU)(name);
    const existingSku = yield prisma.product.findFirst({ where: { sku } });
    if (existingSku) {
        res.json({ message: "Product with this SKU already exists" });
        return;
    }
    const newProduct = yield prisma.product.create({
        data: { name, price, description, sku: sku },
    });
    res.json({ data: newProduct });
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const body = req.body;
    const existingProduct = yield prisma.product.update({
        where: { id: parseInt(id) },
        data: {
            name: body.name,
            price: body.price,
            description: body.description,
        },
    });
    if (!existingProduct) {
        res.json({ message: "There is no product with such id" });
        return;
    }
    res.json({
        message: "Product has been updated",
    });
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const existingProduct = yield prisma.product.delete({
        where: { id: parseInt(id) },
    });
    if (!existingProduct) {
        res.json({ message: "There is no product with such id" });
        return;
    }
    res.json({ message: "Product deleted" });
});
exports.deleteProduct = deleteProduct;
