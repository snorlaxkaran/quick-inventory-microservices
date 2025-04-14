"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
exports.orderRouter = (0, express_1.Router)();
exports.orderRouter.post("/:productId", order_controller_1.createOrder);
