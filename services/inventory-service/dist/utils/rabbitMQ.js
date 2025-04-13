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
exports.consumerProductCreated = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const inventory_controller_1 = require("../controllers/inventory.controller");
const consumerProductCreated = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield amqplib_1.default.connect("amqp://guest:guest@localhost:5672");
        const channel = yield connection.createChannel();
        const queue = "product_created";
        yield channel.assertQueue(queue, { durable: true });
        console.log(`[Inventory] waiting for the message in ${queue}...`);
        channel.consume(queue, (message) => __awaiter(void 0, void 0, void 0, function* () {
            if (!message)
                return;
            if (message !== null) {
                const { productId } = JSON.parse(message.content.toString());
                console.log(`Received productId: ${productId}`);
                try {
                    yield (0, inventory_controller_1.createInventoryForProduct)(productId);
                    channel.ack(message);
                }
                catch (err) {
                    console.error(`Error processing product ${productId}:`, err);
                    channel.nack(message);
                }
            }
        }));
    }
    catch (err) {
        console.error("RabbitMQ connection failed:", err);
    }
});
exports.consumerProductCreated = consumerProductCreated;
