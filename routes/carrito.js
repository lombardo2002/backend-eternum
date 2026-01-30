import { Router } from "express";

const router = Router();

let carrito = [];

// =======================
// GET → OBTENER CARRITO
// =======================
router.get("/", (req, res) => {
  res.json({
    ok: true,
    carrito
  });
});

// =======================
// POST → AGREGAR AL CARRITO
// =======================
router.post("/", (req, res) => {
  const { id, cantidad = 1 } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID requerido" });
  }

  const prod = carrito.find(p => p.id === id);

  if (prod) {
    prod.cantidad += cantidad;
  } else {
    carrito.push({ id, cantidad });
  }

  res.json({
    ok: true,
    carrito
  });
});

// =======================
// DELETE → VACIAR CARRITO
// =======================
router.delete("/", (req, res) => {
  carrito = [];
  res.json({ ok: true });
});

export default router;
