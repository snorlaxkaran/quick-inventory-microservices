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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getAllProducts = exports.generateSKU = void 0;
const client_1 = require("@prisma/client");
const amqplib_1 = __importDefault(require("amqplib"));
const prisma = new client_1.PrismaClient();
function sendProduct(productId, product_name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield amqplib_1.default.connect("amqp://localhost");
            const channel = yield connection.createChannel();
            const routerKey = "product_router_key";
            const exchange = "productId_Exchance";
            const queue = "productId_Queue";
            yield channel.assertExchange(exchange, "direct", {
                durable: true,
            });
            yield channel.assertQueue(queue, { durable: true });
            yield channel.bindQueue(queue, exchange, routerKey);
            channel.publish(exchange, routerKey, Buffer.from(JSON.stringify({ productId, product_name })));
        }
        catch (error) {
            console.error(error);
        }
    });
}
const generateSKU = (productName) => {
    const prefix = productName.replace(/\s+/g, "-").toUpperCase().slice(0, 5);
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
    return `${prefix}-${random}`;
};
exports.generateSKU = generateSKU;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allProducts = yield prisma.product.findMany();
        res.json({
            data: allProducts,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.getAllProducts = getAllProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        const existingProduct = yield prisma.product.findFirst({
            where: { id: id },
        });
        if (!existingProduct) {
            res.json({ message: "There is no product with such id" });
            return;
        }
        res.json({
            data: existingProduct,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.getProduct = getProduct;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price } = req.body;
        if (!name || !price) {
            res
                .status(400)
                .json({ message: "Please provide all the required field" });
            return;
        }
        let sku = (0, exports.generateSKU)(name);
        let tries = 5;
        while ((yield prisma.product.findFirst({ where: { sku } })) && tries > 0) {
            sku = (0, exports.generateSKU)(name);
            tries--;
        }
        if (tries === 0) {
            res.status(500).json({ message: "Failed to generate the SKU" });
            return;
        }
        const newProduct = yield prisma.product.create({
            data: { name, price, description, sku: sku },
        });
        sendProduct(newProduct.id, newProduct.name);
        res.json({ data: newProduct });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid product ID" });
            return;
        }
        const body = req.body;
        const updatedProduct = yield prisma.product.update({
            where: { id: id },
            data: {
                name: body.name,
                price: body.price,
                description: body.description,
            },
        });
        res.json({
            message: "Product has been updated",
            data: updatedProduct,
        });
    }
    catch (error) {
        res.status(404).json({ message: "Product not found" });
        return;
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid product ID" });
            return;
        }
        yield prisma.product.delete({
            where: { id: id },
        });
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.deleteProduct = deleteProduct;
