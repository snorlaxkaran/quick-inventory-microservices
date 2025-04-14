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
exports.createOrder = void 0;
exports.placeOrder = placeOrder;
const amqplib_1 = __importDefault(require("amqplib"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function placeOrder(product_id, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield amqplib_1.default.connect("amqp://localhost");
            const channel = yield connection.createChannel();
            const exchange = "order_exchange";
            const queue = "order_request";
            const inventory_queue = "inventory_response";
            yield channel.assertExchange(exchange, "direct", { durable: true });
            yield channel.assertQueue(queue, { durable: true });
            yield channel.assertQueue(inventory_queue, { durable: true });
            yield channel.bindQueue(queue, exchange, "check_inventory");
            channel.sendToQueue(queue, Buffer.from(JSON.stringify({
                productId: product_id,
                quantity: amount,
            })));
            channel.consume(inventory_queue, (message) => __awaiter(this, void 0, void 0, function* () {
                if (message !== null) {
                    const res = JSON.parse(message.content.toString());
                    if (res.quantity >= amount) {
                        yield prisma.order.create({
                            data: {
                                items: {
                                    name: res.name,
                                    quantity: amount,
                                },
                                status: "success",
                            },
                        });
                        console.log(`Order placed`);
                    }
                    else {
                        console.log(`We dont have enough quantity`);
                    }
                    channel.ack(message);
                }
            }));
        }
        catch (error) {
            console.log(`Unable to place an order`, error);
        }
    });
}
const createOrder = (req, res) => {
    const productId = parseInt(req.params.productId);
    const { amount } = req.body;
    placeOrder(productId, amount);
    res.json({
        message: `Order place`,
        data: { productId, amount },
    });
};
exports.createOrder = createOrder;
