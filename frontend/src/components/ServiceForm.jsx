import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
} from "@mui/material";
import api from "../api";

const SERVICE_TYPES = [
  { value: 'hebergement', label: 'Hébergement' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'developpement', label: 'Développement' },
  { value: 'conseil', label: 'Conseil' },
  { value: 'support', label: 'Support' },
];

export default function ServiceForm({ open, onClose, onServiceSaved, service = null }) {
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    description: '',
    prix: '',
    duree_mois: '',
    conditions: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        nom: service.nom || '',
        type: service.type || '',
        description: service.description || '',
        prix: service.prix || '',
        duree_mois: service.duree_mois || '',
        conditions: service.conditions || '',
        is_active: service.is_active !== false,
      });
    } else {
      setFormData({
        nom: '',
        type: '',
        description: '',
        prix: '',
        duree_mois: '',
        conditions: '',
        is_active: true,
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_active' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        prix: parseFloat(formData.prix) || 0,
        duree_mois: formData.duree_mois ? parseInt(formData.duree_mois) : null,
      };

      if (service) {
        await api.put(`/services/${service.id}`, payload);
      } else {
        await api.post('/services', payload);
      }

      onServiceSaved();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {service ? 'Modifier le service' : 'Nouveau service'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="nom"
                label="Nom du service"
                value={formData.nom}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="type"
                label="Type de service"
                value={formData.type}
                onChange={handleChange}
                select
                fullWidth
                required
                margin="normal"
              >
                {SERVICE_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="prix"
                label="Prix (€)"
                value={formData.prix}
                onChange={handleChange}
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="duree_mois"
                label="Durée (mois)"
                value={formData.duree_mois}
                onChange={handleChange}
                type="number"
                inputProps={{ min: "1" }}
                fullWidth
                margin="normal"
                helperText="Laissez vide pour facturation à l'heure"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="conditions"
                label="Conditions particulières"
                value={formData.conditions}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                }
                label="Service actif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}