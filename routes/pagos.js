import express from "express";
import client from "../config/mercadopago.js";
import { Preference } from "mercadopago";
import { db } from "../config/db.js";

const router = express.Router();

router.post("/crear-preferencia", async (req, res) => {
  try {
    const { carrito } = req.body;

    console.log("🛒 CARRITO:", carrito);

    if (!carrito || carrito.length === 0) {
      return res.status(400).json({ error: "Carrito vacío" });
    }

    const items = [];

    for (const item of carrito) {
      const [rows] = await db.query(
        "SELECT nombre, precio FROM productos WHERE id = ?",
        [item.id]
      );

      if (!rows.length) continue;

      const producto = rows[0];

      items.push({
        title: producto.nombre,
        quantity: item.cantidad,
        unit_price: Number(producto.precio)
      });
    }

    console.log("📦 ITEMS MP:", items);

    if (items.length === 0) {
      return res.status(400).json({ error: "No hay items válidos" });
    }

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items,
        back_urls: {
          success: "http://localhost:5500/success.html",
          failure: "http://localhost:5500/failure.html",
          pending: "http://localhost:5500/pending.html"
        },
        auto_return: "approved"
      }
    });

    res.json({
      init_point: response.body.init_point
    });

  } catch (error) {
    console.error("❌ ERROR MP:", error);
    res.status(500).json({ error: "Error al crear preferencia" });
  }
});

export default router;
