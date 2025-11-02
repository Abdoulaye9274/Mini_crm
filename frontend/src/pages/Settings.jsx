import React, { useState, useEffect } from "react";
import api from "../api";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { Security, Settings as SettingsIcon } from "@mui/icons-material";

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState({
  login: "abdoulaye",
  email: "abdoulaye@crm.com",
  role: "admin", 
  name: "Abdoulaye",
  phone: "0123456789"
});
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des informations utilisateur", error);
        setSnackbar({ open: true, message: "Impossible de charger les informations.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({ open: true, message: "Les nouveaux mots de passe ne correspondent pas.", severity: "error" });
      return;
    }

    try {
      await api.post("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSnackbar({ open: true, message: "Mot de passe mis à jour avec succès !", severity: "success" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe", error);
      const errorMessage = error.response?.data?.message || "Erreur lors du changement de mot de passe.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSave = () => {
    console.log("Profil sauvegardé:", user);
    setEditing(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Paramètres
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<PersonIcon />} label="Mon Profil" />
          <Tab icon={<Security />} label="Sécurité" />
          <Tab icon={<SettingsIcon />} label="Préférences" />
        </Tabs>

        {/* ONGLET PROFIL */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: "#1976d2" }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5">Mon Profil</Typography>
              <Typography color="textSecondary">
                Gérez vos informations personnelles
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Login"
                value={user.login}
                disabled={!editing}
                onChange={(e) => setUser({...user, login: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom complet"
                value={user.name}
                disabled={!editing}
                onChange={(e) => setUser({...user, name: e.target.value})}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={user.email}
                disabled={!editing}
                onChange={(e) => setUser({...user, email: e.target.value})}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={user.phone}
                disabled={!editing}
                onChange={(e) => setUser({...user, phone: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rôle"
                value={user.role}
                disabled
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2 }}>
                {editing ? (
                  <>
                    <Button variant="contained" onClick={handleSave}>
                      Sauvegarder
                    </Button>
                    <Button variant="outlined" onClick={() => setEditing(false)}>
                      Annuler
                    </Button>
                  </>
                ) : (
                  <Button variant="contained" onClick={() => setEditing(true)}>
                    Modifier
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* ONGLET SÉCURITÉ */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Changer le mot de passe</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mot de passe actuel"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nouveau mot de passe"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirmer le nouveau mot de passe"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handlePasswordSubmit}
              >
                Changer le mot de passe
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* ONGLET PRÉFÉRENCES */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6">Préférences de l'application</Typography>
          <Typography color="textSecondary">
            Fonctionnalités à venir...
          </Typography>
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
