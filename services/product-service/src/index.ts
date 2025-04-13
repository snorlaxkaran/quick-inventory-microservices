import express from "express";
import router from "./routes";

const app = express();

app.use(express.json());
app.use("/api", router);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Product service app is listening on port ${port}`);
});
