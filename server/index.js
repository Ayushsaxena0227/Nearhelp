import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import needsRoutes from "./routes/needRoutes.js";
import applicationsRoutes from "./routes/applicationRoutes.js";
import matchesRoutes from "./routes/matchesRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/needs", needsRoutes);
app.use("/applications", applicationsRoutes);
app.use("/matches", matchesRoutes);
app.use("/reviews", reviewRoutes);
app.use("/skills", skillRoutes);
app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
