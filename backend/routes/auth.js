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

  // VALIDATION SIMPLE SANS DB - REMPLACE TOUT LE TRY/CATCH
  if (login === 'abdoulaye' && password === 'abdoulaye123!') {
    console.log("✅ Connexion réussie pour:", login);
    const token = jwt.sign(
      { id: 1, role: 'admin' }, 
      process.env.JWT_SECRET || "votre_secret_jwt", 
      { expiresIn: "1h" }
    );
    res.json({ token, role: 'admin' });
  } else {
    console.log("❌ Identifiants incorrects");
    res.status(401).json({ message: "Identifiants introuvables" });
  }
});

export default router;
