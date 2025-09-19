import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./db.js"; // ✅ Utilisation du pool unique

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import authRoutes from "./routes/auth.js";
app.use("/api/auth", authRoutes);

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

// CRUD Clients
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

// ✅ Endpoint pour les stats
app.get("/api/stats/dashboard", async (req, res) => {
  try {
    const clientCountRes = await pool.query("SELECT COUNT(*) FROM clients");
    const contractCountRes = await pool.query("SELECT COUNT(*) FROM contracts");
    const revenueRes = await pool.query("SELECT COALESCE(SUM(amount), 0) FROM contracts");

    const contractsHistory = [
      { month: "Jan", contracts: 3 },
      { month: "Fév", contracts: 6 },
      { month: "Mar", contracts: 5 },
      { month: "Avr", contracts: 8 },
      { month: "Mai", contracts: 10 },
      { month: "Juin", contracts: 12 },
    ];

    res.json({
      clientCount: parseInt(clientCountRes.rows[0].count),
      contractCount: parseInt(contractCountRes.rows[0].count),
      revenue: revenueRes.rows[0].coalesce || 0,
      contractsHistory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des statistiques" });
  }
});

// ✅ Endpoint pour les activités récentes
app.get("/api/activities/recent", async (req, res) => {
  try {
    const activities = [
      { id: 1, date: "2025-09-18", type: "Client ajouté", description: "Jean Dupont", status: "Succès" },
      { id: 2, date: "2025-09-17", type: "Contrat signé", description: "Contrat #C-123", status: "Succès" },
      { id: 3, date: "2025-09-16", type: "Client modifié", description: "Marie Claire", status: "Succès" },
      { id: 4, date: "2025-09-16", type: "Contrat résilié", description: "Contrat #C-098", status: "Annulé" },
      { id: 5, date: "2025-09-15", type: "Service activé", description: "Hébergement Web", status: "Succès" },
    ];

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors du chargement des activités récentes" });
  }
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erreur serveur" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend démarré sur http://localhost:${PORT}`));
