import express from "express";
import router from "./routes";
import { getProductDataFromQueue } from "./controllers/inventory.controller";

const app = express();
app.use(express.json());

app.use("/api", router);

const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log(`Inventory service app is listening on port ${port}`);
  getProductDataFromQueue();
});
