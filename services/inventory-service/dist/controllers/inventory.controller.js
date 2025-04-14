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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decreaseInventory = exports.increaseInventory = exports.getInventory = exports.getAllInventory = void 0;
exports.getProductDataFromQueue = getProductDataFromQueue;
const amqplib_1 = __importDefault(require("amqplib"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getProductDataFromQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield amqplib_1.default.connect("amqp://localhost");
            const channel = yield connection.createChannel();
            const queue = "productId_Queue";
            yield channel.assertQueue(queue, { durable: true });
            channel.consume(queue, (message) => __awaiter(this, void 0, void 0, function* () {
                if (message !== null) {
                    const productData = JSON.parse(message.content.toString());
                    console.log(`Received the product data`, productData);
                    yield prisma.inventory.create({
                        data: {
                            productId: productData.productId,
                            name: productData.product_name,
                        },
                    });
                    channel.ack(message);
                }
            }));
            channel.consume("order_request", (message) => __awaiter(this, void 0, void 0, function* () {
                if (message !== null) {
                    const { productId } = JSON.parse(message === null || message === void 0 ? void 0 : message.content.toString());
                    const stock = yield prisma.inventory.findUnique({
                        where: {
                            productId: productId,
                        },
                    });
                    channel.sendToQueue("inventory_response", Buffer.from(JSON.stringify(stock)));
                }
            }));
        }
        catch (error) {
            console.log(`Did'nt received the product id`, error);
            return null;
        }
    });
}
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
    const updated = yield prisma.inventory.update({
        where: { productId },
        data: { quantity: { increment: amount } },
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
