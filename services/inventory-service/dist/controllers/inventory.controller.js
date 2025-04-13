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
exports.decreaseInventory = exports.increaseInventory = exports.getInventory = exports.getAllInventory = exports.createInventoryForProduct = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createInventoryForProduct = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.inventory.upsert({
        where: { productId },
        update: {},
        create: { productId, quantity: 0 },
    });
});
exports.createInventoryForProduct = createInventoryForProduct;
const getAllInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allInventory = yield prisma.inventory.findMany();
    res.status(200).json({ indeventory: allInventory });
});
exports.getAllInventory = getAllInventory;
const getInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = parseInt(req.params.productId);
    const stock = yield prisma.inventory.findUnique({ where: { productId } });
    if (!stock) {
        res.status(404).json({ message: "Product not found in inventory" });
        return;
    }
    res.json({ data: stock });
});
exports.getInventory = getInventory;
const increaseInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = parseInt(req.params.productId);
    const { amount } = req.body;
    if (!amount || amount < 1) {
        res.status(400).json({ message: "Invalid amount" });
        return;
    }
    const updated = yield prisma.inventory.upsert({
        where: { productId },
        update: { quantity: { increment: amount } },
        create: { productId, quantity: amount },
    });
    res.status(200).json({ data: updated });
});
exports.increaseInventory = increaseInventory;
const decreaseInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = parseInt(req.params.productId);
    const { amount } = req.body;
    if (!amount || amount < 1) {
        res.status(400).json({ message: "Invalid amount" });
        return;
    }
    const inventory = yield prisma.inventory.findUnique({ where: { productId } });
    if (!inventory || inventory.quantity < amount) {
        res.status(400).json({ message: "Not enough stock" });
        return;
    }
    const updated = yield prisma.inventory.update({
        where: { productId },
        data: { quantity: { decrement: amount } },
    });
    res.status(200).json({ data: updated });
});
exports.decreaseInventory = decreaseInventory;
