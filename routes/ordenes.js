import express from "express";
import { db } from "../config/db.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.js";

const router = express.Router();

// 🛒 Crear orden
router.post("/crear", async (req, res) => {
  try {
    const { carrito, nombre, telefono } = req.body;

    if (!carrito || carrito.length === 0) {
      return res.status(400).json({ ok: false, error: "Carrito vacío" });
    }

    let total = 0;

    for (const item of carrito) {
      const [rows] = await db.query(
        "SELECT precio FROM productos WHERE id = ?",
        [item.id],
      );
      if (!rows.length) continue;
      total += rows[0].precio * item.cantidad;
    }

    const [ordenResult] = await db.query(
      "INSERT INTO ordenes (id_usuario, cliente_nombre, cliente_telefono, total, estado) VALUES (?, ?, ?, ?, ?)",
      [null, nombre, telefono, total, "pendiente"],
    );

    const ordenId = ordenResult.insertId;

    for (const item of carrito) {
      const [rows] = await db.query(
        "SELECT precio FROM productos WHERE id = ?",
        [item.id],
      );
      if (!rows.length) continue;

      await db.query(
        `INSERT INTO orden_items (orden_id, producto_id, cantidad, precio)
         VALUES (?, ?, ?, ?)`,
        [ordenId, item.id, item.cantidad, rows[0].precio],
      );
    }

    res.json({ ok: true, ordenId });
  } catch (error) {
    console.error("Error creando orden:", error.sqlMessage);
    res.status(500).json({ ok: false, error: error.sqlMessage });
  }
});

// 📋 Ver órdenes → SOLO ADMIN
router.get("/", verificarToken, soloAdmin, async (req, res) => {
  try {
    const [ordenes] = await db.query(
      `SELECT o.id, o.cliente_nombre, o.cliente_telefono, o.total, o.estado, o.fecha
   FROM ordenes o
   ORDER BY o.fecha DESC`,
    );

    console.log("Ordenes desde BD", ordenes);

    res.json({ ok: true, data: ordenes });
  } catch (error) {
    console.error("Error obteniendo órdenes:", error);
    res.status(500).json({ ok: false });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM ordenes WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false });
  }
});

// Actualizar estado de una orden
router.put("/:id", soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Solo permitir los 3 estados válidos
    const estadosValidos = ["pendiente", "pagado", "entregado"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ ok: false, error: "Estado inválido" });
    }

    await db.query("UPDATE ordenes SET estado = ? WHERE id = ?", [estado, id]);

    res.json({ ok: true, mensaje: `Orden ${id} actualizada a ${estado}` });
  } catch (error) {
    console.error("Error actualizando orden:", error);
    res.status(500).json({ ok: false });
  }
});

export default router;
