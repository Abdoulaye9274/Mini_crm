
import React, { useState, useEffect } from "react";
import api from "../api";
import {
  Box,
  Typography,
  // Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import LockResetIcon from "@mui/icons-material/LockReset";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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
      
      <Grid container spacing={3}>
        {/* Informations utilisateur */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                Informations personnelles
              </Typography>
              {user && (
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="Nom d'utilisateur" secondary={user.username} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <VpnKeyIcon />
                    </ListItemIcon>
                    <ListItemText primary="Email" secondary={user.email} />
                  </ListItem>
                  {user.role && (
                    <ListItem>
                      <ListItemIcon>
                        <AdminPanelSettingsIcon />
                      </ListItemIcon>
                      <ListItemText primary="Rôle" secondary={user.role} />
                    </ListItem>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Changement de mot de passe */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LockResetIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                Changer le mot de passe
              </Typography>
              <form onSubmit={handlePasswordSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Mot de passe actuel"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nouveau mot de passe"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Mettre à jour le mot de passe
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
