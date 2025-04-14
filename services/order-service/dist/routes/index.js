"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const order_services_1 = require("./order-services");
exports.router = (0, express_1.Router)();
exports.router.use("/order", order_services_1.orderRouter);
