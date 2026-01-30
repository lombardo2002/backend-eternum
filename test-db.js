import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function testDB() {
  try {
    const db = await mysql.createPool({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT,
    });

    const [rows] = await db.query("SELECT 1 + 1 AS resultado");
    console.log("Conexión OK:", rows);
  } catch (error) {
    console.error("Error al conectar a DB:", error);
  }
}

testDB();
