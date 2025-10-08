import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Container, Box, TextField, Button, Typography, Paper } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login: saveUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { login, password });
      localStorage.setItem("token", res.data.token);
      saveUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Identifiants incorrects");
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={4} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: 'primary.main' }}>
          🏢 CRM
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 1 }}>
          Validation RNCP - Concepteur Développeur d'Applications
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Projet réalisé dans le cadre du stage chez Ikoula
        </Typography>
        
        {error && (
          <Typography color="error" align="center" sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
            {error}
          </Typography>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Identifiant"
            placeholder="Saisissez votre identifiant"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
          <TextField
            fullWidth
            type="password"
            margin="normal"
            label="Mot de passe"
            placeholder="Saisissez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button 
            fullWidth 
            variant="contained" 
            sx={{ mt: 3, py: 1.5 }} 
            type="submit"
            size="large"
          >
            Se connecter
          </Button>
        </Box>
        
        <Typography variant="caption" align="center" sx={{ mt: 3, display: 'block' }} color="text.secondary">
          © 2025 - Stage Ikoula | Validation des compétences CDA
        </Typography>
      </Paper>
    </Container>
  );
}
