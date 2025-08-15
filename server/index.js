import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import needsRoutes from "./routes/needRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/needs", needsRoutes);

app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
