import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.js";
import contractRoutes from "./routes/contracts.js";
import serviceRoutes from "./routes/services.js"; // ✅ AJOUTEZ CETTE LIGNE
import { authenticateToken } from "./middleware/auth.js";
import dotenv from "dotenv";
import pool from "./db.js";
dotenv.config();

console.log("🔥 SERVEUR EN COURS DE DÉMARRAGE...");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 MIDDLEWARE DE LOG AJOUTÉ");

// 🚨 AJOUT DE LOGS POUR DEBUG - TRÈS IMPORTANT
app.use((req, res, next) => {
  console.log("🚨🚨🚨 MIDDLEWARE EXÉCUTÉ 🚨🚨🚨");
  console.log(`🌐 REQUÊTE REÇUE: ${req.method} ${req.url}`);
  console.log(`📦 Body:`, req.body);
  next();
});

console.log("🔥 ROUTES AJOUTÉES");
app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/services", serviceRoutes);

// ✅ AJOUTEZ CETTE LIGNE DE DEBUG
console.log("🚀 TOUTES LES ROUTES CHARGÉES - SERVEUR PRÊT");

// Test API
app.get("/", (req, res) => {
  console.log("🏠 Route / appelée");
  res.send("🚀 API Mini CRM fonctionne ✅");
});

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

// ROUTE DOSSIERS - VERSION SIMPLE POUR TEST
app.get("/api/dossiers", async (req, res) => {
  console.log("🗂️ Route /api/dossiers appelée !");
  res.json([
    {
      id: 1,
      client_id: 1,
      id_dossier: "DOS-2024-001",
      status: "en_cours",
      type_dossier: "support",
      priorite: "haute",
      sujet: "Test dossier",
      description: "Description test",
      client_name: "Client Test",
      client_email: "test@test.com",
      responsable_login: "admin",
      created_at: new Date().toISOString()
    }
  ]);
});

// POST créer un dossier
app.post("/api/dossiers", authenticateToken, async (req, res) => {
  const { 
    client_id, id_dossier, status, type_dossier, priorite, 
    sujet, description, remarques, document_url, responsable_id,
    date_echeance, cout_estime 
  } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO client_dossiers 
       (client_id, id_dossier, status, type_dossier, priorite, sujet, description, 
        remarques, document_url, responsable_id, date_echeance, cout_estime) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [client_id, id_dossier, status, type_dossier, priorite, sujet, description, 
       remarques, document_url, responsable_id, date_echeance, cout_estime]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur création dossier:", error);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
});

// PUT modifier un dossier
app.put("/api/dossiers/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { 
    status, type_dossier, priorite, sujet, description, remarques, 
    document_url, responsable_id, date_echeance, cout_estime, temps_passe_heures 
  } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE client_dossiers 
       SET status=$1, type_dossier=$2, priorite=$3, sujet=$4, description=$5, 
           remarques=$6, document_url=$7, responsable_id=$8, date_echeance=$9, 
           cout_estime=$10, temps_passe_heures=$11, updated_at=CURRENT_TIMESTAMP
       WHERE id=$12 RETURNING *`,
      [status, type_dossier, priorite, sujet, description, remarques, 
       document_url, responsable_id, date_echeance, cout_estime, temps_passe_heures, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur modification dossier:", error);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
});

// DELETE supprimer un dossier
app.delete("/api/dossiers/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM client_dossiers WHERE id = $1", [id]);
    res.json({ message: "Dossier supprimé" });
  } catch (error) {
    console.error("Erreur suppression dossier:", error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// GET dossiers d'un client spécifique
app.get("/api/dossiers/client/:clientId", authenticateToken, async (req, res) => {
  const { clientId } = req.params;
  try {
    const result = await pool.query(`
      SELECT d.*, u.login as responsable_login
      FROM client_dossiers d
      LEFT JOIN users u ON d.responsable_id = u.id
      WHERE d.client_id = $1
      ORDER BY d.created_at DESC
    `, [clientId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur dossiers client:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
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

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Backend démarré sur http://localhost:${PORT}`));

// ⛔ NE PAS démarrer le serveur si on est en mode test
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend sur http://localhost:${PORT}`);
    console.log("🔥 SERVEUR COMPLÈTEMENT DÉMARRÉ");
  });
}

export default app;