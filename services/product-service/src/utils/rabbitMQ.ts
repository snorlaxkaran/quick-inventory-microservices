import amqp from "amqplib";

let channel: amqp.Channel;

export const getChannel = async () => {
  if (channel) return channel;
  const connection = await amqp.connect("amqp://localhost");
  channel = await connection.createChannel();
  return channel;
};
