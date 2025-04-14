import amqp from "amqplib";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getProductDataFromQueue() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const queue = "productId_Queue";

    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (message) => {
      if (message !== null) {
        const productData = JSON.parse(message.content.toString());
        console.log(`Received the product data`, productData);
        await prisma.inventory.create({
          data: {
            productId: productData.productId,
            name: productData.product_name,
          },
        });
        channel.ack(message);
      }
    });

    channel.consume("order_request", async (message) => {
      if (message !== null) {
        const { productId } = JSON.parse(message?.content.toString());
        const stock = await prisma.inventory.findUnique({
          where: {
            productId: productId,
          },
        });
        channel.sendToQueue(
          "inventory_response",
          Buffer.from(JSON.stringify(stock))
        );
      }
    });
  } catch (error) {
    console.log(`Did'nt received the product id`, error);
    return null;
  }
}

export const getAllInventory = async (req: Request, res: Response) => {
  const allInventory = await prisma.inventory.findMany();

  res.status(200).json({ indeventory: allInventory });
};

export const getInventory = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const stock = await prisma.inventory.findUnique({ where: { productId } });

  if (!stock) {
    res.status(404).json({ message: "Product not found in inventory" });
    return;
  }
  res.json({ data: stock });
};

export const increaseInventory = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const { amount } = req.body;
  if (!amount || amount < 1) {
    res.status(400).json({ message: "Invalid amount" });
    return;
  }
  const updated = await prisma.inventory.update({
    where: { productId },
    data: { quantity: { increment: amount } },
  });
  res.status(200).json({ data: updated });
};

export const decreaseInventory = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const { amount } = req.body;
  if (!amount || amount < 1) {
    res.status(400).json({ message: "Invalid amount" });
    return;
  }
  const inventory = await prisma.inventory.findUnique({ where: { productId } });
  if (!inventory || inventory.quantity < amount) {
    res.status(400).json({ message: "Not enough stock" });
    return;
  }
  const updated = await prisma.inventory.update({
    where: { productId },
    data: { quantity: { decrement: amount } },
  });

  res.status(200).json({ data: updated });
};
