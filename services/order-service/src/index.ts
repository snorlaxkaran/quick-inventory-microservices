import express from "express";
import { router } from "./routes";

const app = express();

app.use(express.json());

app.use("/api", router);

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`Order services is listening to port ${port}`);
});
