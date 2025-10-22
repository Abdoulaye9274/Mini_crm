import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Assignment as AssignIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import api from "../api";
import ServiceForm from "../components/ServiceForm";
import ServiceAssignDialog from "../components/ServiceAssignDialog";

const SERVICE_TYPE_LABELS = {
  hebergement: 'Hébergement',
  maintenance: 'Maintenance',
  developpement: 'Développement',
  conseil: 'Conseil',
  support: 'Support',
};

const SERVICE_TYPE_COLORS = {
  hebergement: 'primary',
  maintenance: 'secondary',
  developpement: 'success',
  conseil: 'warning',
  support: 'error',
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedServiceForAssign, setSelectedServiceForAssign] = useState(null);
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalRevenue: 0,
    totalClients: 0,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const filtered = services.filter(service =>
      service.nom.toLowerCase().includes(search.toLowerCase()) ||
      service.type.toLowerCase().includes(search.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredServices(filtered);
  }, [services, search]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/services");
      setServices(response.data);
      
      // Calculer les stats
      const totalServices = response.data.length;
      const activeServices = response.data.filter(s => s.is_active).length;
      const totalRevenue = response.data.reduce((sum, s) => sum + (parseFloat(s.revenue_total) || 0), 0);
      const totalClients = response.data.reduce((sum, s) => sum + (parseInt(s.clients_count) || 0), 0);
      
      setStats({ totalServices, activeServices, totalRevenue, totalClients });
    } catch (error) {
      console.error("Erreur lors de la récupération des services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setServiceFormOpen(true);
  };

  const handleDelete = async (service) => {
    if (window.confirm(`Êtes-vous sûr de vouloir désactiver le service "${service.nom}" ?`)) {
      try {
        await api.delete(`/services/${service.id}`);
        fetchServices();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleAssign = (service) => {
    setSelectedServiceForAssign(service.id);
    setAssignDialogOpen(true);
  };

  const formatPrice = (price) => {
    return price ? `${parseFloat(price).toFixed(2)}€` : 'N/A';
  };

  const formatDuration = (months) => {
    if (!months) return 'À l\'heure';
    return months === 1 ? '1 mois' : `${months} mois`;
  };

  return (
    <Box>
      {/* En-tête avec statistiques */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "#fff" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}>
          Gestion des Services
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{stats.totalServices}</Typography>
                <Typography variant="body2">Services Total</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e8f5e8' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">{stats.activeServices}</Typography>
                <Typography variant="body2">Services Actifs</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">{stats.totalClients}</Typography>
                <Typography variant="body2">Clients Abonnés</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fce4ec' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">{formatPrice(stats.totalRevenue)}</Typography>
                <Typography variant="body2">Revenus Mensuels</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Barre d'actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="Rechercher un service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<AssignIcon />}
              onClick={() => setAssignDialogOpen(true)}
            >
              Attribuer Service
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedService(null);
                setServiceFormOpen(true);
              }}
            >
              Nouveau Service
            </Button>
          </Box>
        </Box>

        {/* Tableau des services */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Service</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Prix</strong></TableCell>
                <TableCell><strong>Durée</strong></TableCell>
                <TableCell><strong>Clients</strong></TableCell>
                <TableCell><strong>Revenus</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    Aucun service trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{service.nom}</Typography>
                        {service.description && (
                          <Typography variant="caption" color="text.secondary">
                            {service.description.substring(0, 50)}...
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={SERVICE_TYPE_LABELS[service.type] || service.type}
                        color={SERVICE_TYPE_COLORS[service.type] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatPrice(service.prix)}</TableCell>
                    <TableCell>{formatDuration(service.duree_mois)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{service.clients_count || 0}</Typography>
                        {service.clients_count > 0 && <TrendingUpIcon fontSize="small" color="success" />}
                      </Box>
                    </TableCell>
                    <TableCell>{formatPrice(service.revenue_total)}</TableCell>
                    <TableCell>
                      <Chip
                        label={service.is_active ? 'Actif' : 'Inactif'}
                        color={service.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleAssign(service)} title="Attribuer">
                          <AssignIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEdit(service)} title="Modifier">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(service)} 
                          title="Désactiver"
                          disabled={!service.is_active}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Formulaire de service */}
      <ServiceForm
        open={serviceFormOpen}
        onClose={() => {
          setServiceFormOpen(false);
          setSelectedService(null);
        }}
        onServiceSaved={fetchServices}
        service={selectedService}
      />

      {/* Dialog d'attribution */}
      <ServiceAssignDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setSelectedServiceForAssign(null);
        }}
        onAssigned={fetchServices}
        serviceId={selectedServiceForAssign}
      />
    </Box>
  );
}