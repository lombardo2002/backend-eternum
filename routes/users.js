import express from "express";
import { db } from "../config/db.js";
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id, nombre, rol FROM usuarios WHERE email = ? AND password = ?",
      [email, password]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.json({ usuario: rows[0] });
  } catch (err) {
    console.error("Error login:", err);
    res.status(500).json({ error: "Error servidor" });
  }
});

export default router;
