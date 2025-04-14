import { Request, Response } from "express";
import amqp from "amqplib";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function placeOrder(product_id: number, amount: number) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "order_exchange";
    const queue = "order_request";
    const inventory_queue = "inventory_response";

    await channel.assertExchange(exchange, "direct", { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.assertQueue(inventory_queue, { durable: true });

    await channel.bindQueue(queue, exchange, "check_inventory");

    channel.sendToQueue(
      queue,
      Buffer.from(
        JSON.stringify({
          productId: product_id,
          quantity: amount,
        })
      )
    );
    channel.consume(inventory_queue, async (message) => {
      if (message !== null) {
        const res = JSON.parse(message.content.toString());

        if (res.quantity >= amount) {
          await prisma.order.create({
            data: {
              items: {
                name: res.name,
                quantity: amount,
              },
              status: "success",
            },
          });
          console.log(`Order placed`);
        } else {
          console.log(`We dont have enough quantity`);
        }
        channel.ack(message);
      }
    });
  } catch (error) {
    console.log(`Unable to place an order`, error);
  }
}

export const createOrder = (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const { amount } = req.body;

  placeOrder(productId, amount);

  res.json({
    message: `Order place`,
    data: { productId, amount },
  });
};
