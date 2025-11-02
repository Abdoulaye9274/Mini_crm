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

  // PAR :
  try {
    // Base d'utilisateurs avec hashs bcrypt
    const users = [
      {
        id: 1,
        login: 'abdoulaye',
        password: '$2b$10$NLEMPX8vHQKVPV7R7z3bEeyBSuRtqNudWpudRiiVTuK0zx93A0f/O', // abdoulaye123!
        role: 'admin'
      }
    ];

    const user = users.find(u => u.login === login);
    
    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return res.status(401).json({ message: "Identifiants introuvables" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log("❌ Mot de passe incorrect");
      return res.status(401).json({ message: "Identifiants introuvables" });
    }

    console.log("✅ Connexion réussie pour:", login);
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || "votre_secret_jwt", 
      { expiresIn: "1h" }
    );
    res.json({ token, role: user.role });

  } catch (error) {
    console.error("Erreur auth:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
