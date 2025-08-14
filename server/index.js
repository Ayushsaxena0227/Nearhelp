import express from "express";
import cors from "cors";
import statusRoute from "./routes/status.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/status", statusRoute);

app.listen(5000, () => console.log("Server running on port 5000"));
