import { Router } from "express";
import { db } from "../config/db.js";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file,cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const uploads = multer({ storage });

// GET /api/productos
router.get("/", async (req, res) => {
  try {
    const {
      material,
      tipo,
      destacado,
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const where = [];
    const params = [];

    if (material) {
      where.push("material = ?");
      params.push(material);
    }

    if (tipo) {
      where.push("tipo = ?");
      params.push(tipo);
    }

    if (destacado === "true") {
      where.push("destacado = 1");
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // total
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM productos ${whereSQL}`,
      params
    );

    const total = countRows[0].total;

    // datos
    const [rows] = await db.query(
      `SELECT * FROM productos ${whereSQL} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      ok: true,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      },
      data: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Error al obtener productos" });
  }
});

// GET /api/productos/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM productos WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener producto", error });
    res.status(500).json({ ok: false, error: error.message});
  }
});

// POST crear producto (admin) - soporta múltiples imágenes
router.post("/", uploads.array("imagenes", 10), async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, material, tipo, destacado } = req.body;

    // req.files será un array de imágenes subidas
    const imagenes = req.files ? req.files.map(f => f.filename) : [];

    // La primera imagen será la "principal"
    const imagenPrincipal = imagenes.length ? imagenes[0] : null;

    const [result] = await db.query(
      `INSERT INTO productos 
      (nombre, descripcion, precio, stock, material, tipo, imagen, imagenes, destacado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, precio, stock, material, tipo, imagenPrincipal, JSON.stringify(imagenes), destacado || 0]
    );

    res.json({ ok: true, id: result.insertId });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ ok: false, error: "Error al crear producto" });
  }
});


// PUT editar producto (admin)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, subcategoria, precio, stock, descripcion } = req.body;
    await db.query(
      "UPDATE productos SET nombre=?, categoria=?, subcategoria=?, precio=?, stock=?, descripcion=? WHERE id=?",
      [nombre, categoria, subcategoria, precio, stock, descripcion, id]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false });
  }
}); 

// DELETE producto (admin)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM productos WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error:error.message });
  }
});


export default router;
