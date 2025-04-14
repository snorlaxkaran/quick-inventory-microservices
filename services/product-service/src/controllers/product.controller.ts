import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import amqp from "amqplib";

const prisma = new PrismaClient();

async function sendProduct(productId: number, product_name: string) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const routerKey = "product_router_key";
    const exchange = "productId_Exchance";
    const queue = "productId_Queue";

    await channel.assertExchange(exchange, "direct", {
      durable: true,
    });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routerKey);

    channel.publish(
      exchange,
      routerKey,
      Buffer.from(JSON.stringify({ productId, product_name }))
    );
  } catch (error) {
    console.error(error);
  }
}

export const generateSKU = (productName: string) => {
  const prefix = productName.replace(/\s+/g, "-").toUpperCase().slice(0, 5);
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
  return `${prefix}-${random}`;
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const allProducts = await prisma.product.findMany();
    res.json({
      data: allProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    const existingProduct = await prisma.product.findFirst({
      where: { id: id },
    });
    if (!existingProduct) {
      res.json({ message: "There is no product with such id" });
      return;
    }
    res.json({
      data: existingProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !price) {
      res
        .status(400)
        .json({ message: "Please provide all the required field" });
      return;
    }
    let sku = generateSKU(name);
    let tries = 5;

    while ((await prisma.product.findFirst({ where: { sku } })) && tries > 0) {
      sku = generateSKU(name);
      tries--;
    }
    if (tries === 0) {
      res.status(500).json({ message: "Failed to generate the SKU" });
      return;
    }

    const newProduct = await prisma.product.create({
      data: { name, price, description, sku: sku },
    });
    sendProduct(newProduct.id, newProduct.name);
    res.json({ data: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }
    const body = req.body;
    const updatedProduct = await prisma.product.update({
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
  } catch (error) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }
    await prisma.product.delete({
      where: { id: id },
    });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
