import amqp from "amqplib";
import { createInventoryForProduct } from "../controllers/inventory.controller";

export const consumerProductCreated = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:guest@localhost:5672");
    const channel = await connection.createChannel();
    const queue = "product_created";

    await channel.assertQueue(queue, { durable: true });
    console.log(`[Inventory] waiting for the message in ${queue}...`);

    channel.consume(queue, async (message) => {
      if (!message) return;
      if (message !== null) {
        const { productId } = JSON.parse(message.content.toString());
        console.log(`Received productId: ${productId}`);
        try {
          await createInventoryForProduct(productId);
          channel.ack(message);
        } catch (err) {
          console.error(`Error processing product ${productId}:`, err);
          channel.nack(message);
        }
      }
    });
  } catch (err) {
    console.error("RabbitMQ connection failed:", err);
  }
};
