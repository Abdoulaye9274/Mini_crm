import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Container, Box, TextField, Button, Typography, Paper } from "@mui/material";
import { useAuth } from "../context/AuthContext"; // ✅ Ajout

export default function Login() {
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("admin123!");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login: saveUser } = useAuth(); // ✅ pour sauvegarder l'utilisateur

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { login, password }); // ✅ attention à l’URL
      localStorage.setItem("token", res.data.token);
      saveUser(res.data.user); // ✅ enregistre user dans le contexte
      navigate("/dashboard");
    } catch (err) {
      setError("Identifiants incorrects");
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={4} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Connexion
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <TextField
            fullWidth
            type="password"
            margin="normal"
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">
            Se connecter
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
