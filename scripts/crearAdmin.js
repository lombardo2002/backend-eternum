import bcrypt from "bcrypt";
import { db } from "../config/db.js";

const crearAdmin = async () => {
    const nombre = "Admin Eternum";
    const email = "admin@eternum.com";
    const passwordPlano = "123456.g";
    const rol = "admin";

    const hash = await bcrypt.hash(passwordPlano, 10);

    await db.query(
        "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
        [nombre, email, hash, rol]
    );

    console.log("Admin creado con éxito");
    process.exit();
};

crearAdmin();