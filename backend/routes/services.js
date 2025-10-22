import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import pool from "../db.js";

const router = express.Router();

// GET tous les services
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             COUNT(cs.id) as clients_count,
             SUM(cs.prix_convenu) as revenue_total
      FROM services s
      LEFT JOIN client_services cs ON s.id = cs.service_id AND cs.status = 'actif'
      GROUP BY s.id
      ORDER BY s.nom
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur services:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST créer un service
router.post("/", authenticateToken, async (req, res) => {
  const { nom, type, prix, description, duree_mois, conditions } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO services (nom, type, prix, description, duree_mois, conditions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [nom, type, prix, description, duree_mois, conditions]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur création service:", error);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
});

// PUT modifier un service
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nom, type, prix, description, duree_mois, conditions, is_active } = req.body;
  try {
    const result = await pool.query(
      "UPDATE services SET nom=$1, type=$2, prix=$3, description=$4, duree_mois=$5, conditions=$6, is_active=$7 WHERE id=$8 RETURNING *",
      [nom, type, prix, description, duree_mois, conditions, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur modification service:", error);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
});

// DELETE supprimer un service
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE services SET is_active = false WHERE id = $1", [id]);
    res.json({ message: "Service désactivé" });
  } catch (error) {
    console.error("Erreur suppression service:", error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// GET services d'un client spécifique
router.get("/client/:clientId", authenticateToken, async (req, res) => {
  const { clientId } = req.params;
  try {
    const result = await pool.query(`
      SELECT s.*, cs.date_debut, cs.date_fin, cs.status, cs.prix_convenu, cs.notes
      FROM services s
      JOIN client_services cs ON s.id = cs.service_id
      WHERE cs.client_id = $1
      ORDER BY cs.date_debut DESC
    `, [clientId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur services client:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST attribuer un service à un client
router.post("/assign", authenticateToken, async (req, res) => {
  const { client_id, service_id, date_debut, date_fin, prix_convenu, notes } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO client_services (client_id, service_id, date_debut, date_fin, prix_convenu, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [client_id, service_id, date_debut, date_fin, prix_convenu, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur attribution service:", error);
    res.status(500).json({ error: "Erreur lors de l'attribution" });
  }
});

export default router;