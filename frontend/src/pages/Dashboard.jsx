import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Grid,
  Card,
  // CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatCard({ title, value, icon, color }) {
  return (
    <Card
      elevation={3}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        borderRadius: 3,
        bgcolor: color,
        color: "#fff",
      }}
    >
      <Box sx={{ mr: 2 }}>{icon}</Box>
      <Box>
        <Typography variant="body2">{title}</Typography>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {value}
        </Typography>
      </Box>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsRes = await api.get("/stats/dashboard");
        const activitiesRes = await api.get("/activities/recent");
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: "primary.main",
          color: "#fff",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Tableau de bord
        </Typography>
        <Typography>Vue d’ensemble de vos données</Typography>
      </Paper>

      {/* Statistiques clés */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Clients"
            value={stats?.clientCount || 0}
            icon={<PeopleIcon fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Contrats"
            value={stats?.contractCount || 0}
            icon={<DescriptionIcon fontSize="large" />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Chiffre d'affaires"
            value={`${stats?.revenue || 0} €`}
            icon={<MonetizationOnIcon fontSize="large" />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tendance"
            value="+15%"
            icon={<TrendingUpIcon fontSize="large" />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      {/* Graphique */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Évolution des contrats
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats?.contractsHistory || []}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="contracts" stroke="#1976d2" />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Activités récentes */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Activités récentes
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((act) => (
              <TableRow key={act.id}>
                <TableCell>{act.date}</TableCell>
                <TableCell>{act.type}</TableCell>
                <TableCell>{act.description}</TableCell>
                <TableCell>{act.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
