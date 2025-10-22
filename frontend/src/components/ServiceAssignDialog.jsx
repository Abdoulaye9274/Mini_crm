import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
} from "@mui/material";
import api from "../api";

export default function ServiceAssignDialog({ open, onClose, onAssigned, serviceId = null }) {
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: serviceId || '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '',
    prix_convenu: '',
    notes: '',
  });

  useEffect(() => {
    fetchClients();
    fetchServices();
  }, []);

  useEffect(() => {
    if (serviceId) {
      setFormData(prev => ({ ...prev, service_id: serviceId }));
    }
  }, [serviceId]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Erreur clients:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data.filter(s => s.is_active));
    } catch (error) {
      console.error('Erreur services:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        prix_convenu: parseFloat(formData.prix_convenu) || null,
      };
      
      await api.post('/services/assign', payload);
      onAssigned();
      onClose();
    } catch (error) {
      console.error('Erreur attribution:', error);
    }
  };

  const selectedService = services.find(s => s.id == formData.service_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Attribuer un service à un client</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Client"
                value={formData.client_id}
                onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                select
                fullWidth
                required
                margin="normal"
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Service"
                value={formData.service_id}
                onChange={(e) => setFormData(prev => ({ ...prev, service_id: e.target.value }))}
                select
                fullWidth
                required
                margin="normal"
                disabled={!!serviceId}
              >
                {services.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.nom} - {service.prix}€
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            {selectedService && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  📋 {selectedService.description}
                  {selectedService.duree_mois && ` • Durée: ${selectedService.duree_mois} mois`}
                  {selectedService.conditions && ` • ${selectedService.conditions}`}
                </Typography>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                label="Date de début"
                type="date"
                value={formData.date_debut}
                onChange={(e) => setFormData(prev => ({ ...prev, date_debut: e.target.value }))}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Date de fin (optionnel)"
                type="date"
                value={formData.date_fin}
                onChange={(e) => setFormData(prev => ({ ...prev, date_fin: e.target.value }))}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Prix convenu (€)"
                type="number"
                value={formData.prix_convenu}
                onChange={(e) => setFormData(prev => ({ ...prev, prix_convenu: e.target.value }))}
                fullWidth
                margin="normal"
                inputProps={{ step: "0.01", min: "0" }}
                placeholder={selectedService ? `${selectedService.prix}€` : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained">
            Attribuer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}