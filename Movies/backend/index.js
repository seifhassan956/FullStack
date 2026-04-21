import express from "express";
import cors from "cors";
import cookie_parser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/UserRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import Path from "path";

dotenv.config();
connectDB();

const app = express();

// Enable CORS for your frontend
app.use(cors({
  origin: 'https://seif-movies.netlify.app/',
  credentials: true,               
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookie_parser());


app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

const __dirname = Path.resolve();
app.use("/uploads", express.static(Path.join(Path.resolve(), "uploads")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});