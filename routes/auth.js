import { Router } from "express";
import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const usuario = rows[0];

    // 🔐 Comparar password
    const ok = await bcrypt.compare(password, usuario.password);

    if (!ok) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol},
      process.env.JWT_SECRET || "secreto_super_eternum",
      { expiresIn: "2h"}
    );

    res.json({
      ok: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

export default router;
