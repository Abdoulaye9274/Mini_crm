import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/login", async (req, res) => {
  console.log("🚨 REQUÊTE REÇUE SUR /login");
  console.log("Body reçu:", req.body);
  
  const { login, password } = req.body;
  
  console.log("🔍 Tentative de connexion pour:", login);
  console.log("🔐 Mot de passe reçu:", password);

  try {
    const result = await pool.query("SELECT * FROM users WHERE login = $1", [login]);
    
    console.log("📊 Résultat de la requête:", result.rows.length, "utilisateur(s) trouvé(s)");
    
    if (result.rows.length > 0) {
      console.log("👤 Utilisateur trouvé:", { id: result.rows[0].id, login: result.rows[0].login, role: result.rows[0].role });
    }

    if (result.rows.length === 0) {
      console.log("❌ Aucun utilisateur trouvé avec le login:", login);
      return res.status(401).json({ message: "Identifiants introuvables" });
    }

    const user = result.rows[0];
    console.log("🔐 Comparaison des mots de passe...");
    console.log("🔐 Hash en base:", user.password);
    const match = await bcrypt.compare(password, user.password);
    console.log("🔐 Résultat de la comparaison:", match);

    if (!match) {
      console.log("❌ Mot de passe incorrect");
      return res.status(401).json({ message: "Identifiants introuvables" });
    }

    console.log("✅ Connexion réussie pour:", login);
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, role: user.role });
  } catch (error) {
    console.error("💥 Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
