"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const rabbitMQ_1 = require("./utils/rabbitMQ");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api", routes_1.default);
const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Inventory service app is listening on port ${port}`);
    (0, rabbitMQ_1.consumerProductCreated)();
});
