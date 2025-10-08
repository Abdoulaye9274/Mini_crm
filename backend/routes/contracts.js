// ✅ routes/contracts.js
import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all contracts - 🚨 MODIFIÉ POUR INCLURE LES NOMS DES CLIENTS
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("🔍 GET /api/contracts - Récupération avec JOIN");
    const result = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.amount,
        c.start_date,
        c.end_date,
        c.status,
        c.client_id,
        cl.name as client_name
      FROM contracts c
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.start_date DESC
    `);
    console.log("📊 Contrats avec clients:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("💥 Erreur GET contracts:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get a single contract
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM contracts WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contrat non trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Create a new contract
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { client_id, ref, amount, start_date, end_date, status } = req.body;

    // 🚨 Utiliser "ref" comme "title"
    const title = ref || "Contrat sans titre";

    const result = await pool.query(
      "INSERT INTO contracts (client_id, title, amount, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [client_id, title, amount, start_date, end_date, status || 'actif']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur création contrat:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a contract
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, start_date, end_date, amount, status } = req.body;
    const result = await pool.query(
      "UPDATE contracts SET client_id = $1, start_date = $2, end_date = $3, amount = $4, status = $5 WHERE id = $6 RETURNING *",
      [client_id, start_date, end_date, amount, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contrat non trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Delete a contract
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM contracts WHERE id = $1 RETURNING *", [id]);        
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contrat non trouvé" });
    }
    res.status(204).send(); // No content
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
