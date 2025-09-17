import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Test API
app.get("/", (req, res) => {
  res.send("🚀 API Mini CRM fonctionne ✅");
});

// Authentification
app.post("/api/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE login = $1", [login]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Identifiants introuvables" });

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Identifiants introuvables" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user.id, login: user.login, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Middleware de vérification du token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide" });
    req.user = user;
    next();
  });
}

// CRUD Clients (protégé)
app.get("/api/clients", authenticateToken, async (req, res) => {
  const result = await pool.query("SELECT * FROM clients ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/api/clients", authenticateToken, async (req, res) => {
  const { name, email, phone } = req.body;
  const result = await pool.query(
    "INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
    [name, email, phone]
  );
  res.json(result.rows[0]);
});

app.put("/api/clients/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  const result = await pool.query(
    "UPDATE clients SET name=$1, email=$2, phone=$3 WHERE id=$4 RETURNING *",
    [name, email, phone, id]
  );
  res.json(result.rows[0]);
});

app.delete("/api/clients/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM clients WHERE id=$1", [id]);
  res.json({ message: "Client supprimé" });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erreur serveur" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend démarré sur http://localhost:${PORT}`));
