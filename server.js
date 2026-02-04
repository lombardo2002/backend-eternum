import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js"
import pagosRoutes from "./routes/pagos.js"

dotenv.config();

import productsRoutes from "./routes/products.js";
import carritoRoutes from "./routes/carrito.js";
import ordenesRoutes from "./routes/ordenes.js";
import userRoutes from "./routes/users.js";

const app = express();

// middlewares
app.use(cors({
  origin: 'https://eternum-eclat.netlify.app'
}));
app.use(express.json());
app.use("/api/ordenes", ordenesRoutes);

// rutas API
app.use("/api/productos", productsRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pagos", pagosRoutes);
app.use ("/api/users", userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/ordenes", ordenesRoutes);

// prueba
app.get("/", (req, res) => {
  res.send("Backend Eternum funcionando ✔️");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

