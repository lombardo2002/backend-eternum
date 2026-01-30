import jwt from "jsonwebtoken";

export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token requerido" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secreto_super_eternum"
    );
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

export function soloAdmin(req, res, next) {
  if (!req.usuario) return res.status(401).json({ error: "No autorizado" });
  if (req.usuario.rol !== "admin") {
    return res.status(403).json({ error: "Solo admin" });
  }
  next();
}
