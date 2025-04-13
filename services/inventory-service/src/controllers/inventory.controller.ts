import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createInventoryForProduct = async (productId: number) => {
  return await prisma.inventory.upsert({
    where: { productId },
    update: {},
    create: { productId, quantity: 0 },
  });
};

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
  const updated = await prisma.inventory.upsert({
    where: { productId },
    update: { quantity: { increment: amount } },
    create: { productId, quantity: amount },
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
