import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Button, Box, Avatar
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DescriptionIcon from "@mui/icons-material/Description";

const drawerWidth = 220;

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6fa" }}>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#1976d2",
            color: "#fff"
          }
        }}
      >
        <Toolbar>
          <Avatar sx={{ bgcolor: "#fff", color: "#1976d2", mr: 1 }}>CRM</Avatar>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>Mini CRM</Typography>
        </Toolbar>
        <List>
  <ListItemButton onClick={() => navigate("/dashboard")}>
    <ListItemIcon sx={{ color: "#fff" }}><PeopleIcon /></ListItemIcon>
    <ListItemText primary="Tableau de bord" />
  </ListItemButton>

  <ListItemButton onClick={() => navigate("/dashboard/clients")}>
    <ListItemIcon sx={{ color: "#fff" }}><PeopleIcon /></ListItemIcon>
    <ListItemText primary="Clients" />
  </ListItemButton>

  <ListItemButton onClick={() => navigate("/dashboard/contracts")}>
    <ListItemIcon sx={{ color: "#fff" }}><DescriptionIcon /></ListItemIcon>
    <ListItemText primary="Contrats" />
  </ListItemButton>

  <ListItemButton onClick={() => navigate("/dashboard/settings")}>
    <ListItemIcon sx={{ color: "#fff" }}><SettingsIcon /></ListItemIcon>
    <ListItemText primary="Paramètres" />
  </ListItemButton>
</List>

        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<LogoutIcon />}
            fullWidth
            onClick={handleLogout}
            sx={{ bgcolor: "#fff", color: "#1976d2", fontWeight: "bold" }}
          >
            Déconnexion
          </Button>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: "#fff", color: "#1976d2" }}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: "bold" }}>
              Tableau de bord
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
