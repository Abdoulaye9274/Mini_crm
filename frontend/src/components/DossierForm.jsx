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
  Grid,
  Typography,
  Chip,
} from "@mui/material";
import api from "../api";

const DOSSIER_STATUS = [
  { value: 'nouveau', label: 'Nouveau', color: 'info' },
  { value: 'en_cours', label: 'En cours', color: 'warning' },
  { value: 'attente_client', label: 'Attente client', color: 'secondary' },
  { value: 'resolu', label: 'Résolu', color: 'success' },
  { value: 'ferme', label: 'Fermé', color: 'default' },
];

const DOSSIER_TYPES = [
  { value: 'support', label: 'Support technique' },
  { value: 'projet', label: 'Projet' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'facturation', label: 'Facturation' },
  { value: 'commercial', label: 'Commercial' },
];

const PRIORITES = [
  { value: 'basse', label: 'Basse', color: 'success' },
  { value: 'normale', label: 'Normale', color: 'info' },
  { value: 'haute', label: 'Haute', color: 'warning' },
  { value: 'critique', label: 'Critique', color: 'error' },
];

export default function DossierForm({ open, onClose, onDossierSaved, dossier = null }) {
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    id_dossier: '',
    status: 'nouveau',
    type_dossier: '',
    priorite: 'normale',
    sujet: '',
    description: '',
    remarques: '',
    document_url: '',
    responsable_id: '',
    date_echeance: '',
    cout_estime: '',
    temps_passe_heures: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
      fetchUsers();
      
      if (dossier) {
        setFormData({
          client_id: dossier.client_id || '',
          id_dossier: dossier.id_dossier || '',
          status: dossier.status || 'nouveau',
          type_dossier: dossier.type_dossier || '',
          priorite: dossier.priorite || 'normale',
          sujet: dossier.sujet || '',
          description: dossier.description || '',
          remarques: dossier.remarques || '',
          document_url: dossier.document_url || '',
          responsable_id: dossier.responsable_id || '',
          date_echeance: dossier.date_echeance ? dossier.date_echeance.split('T')[0] : '',
          cout_estime: dossier.cout_estime || '',
          temps_passe_heures: dossier.temps_passe_heures || '',
        });
      } else {
        // Générer un ID de dossier automatique
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const autoId = `DOS-${year}${month}-${random}`;
        
        setFormData(prev => ({
          ...prev,
          id_dossier: autoId,
        }));
      }
    }
  }, [open, dossier]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Erreur clients:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Simul de users - vous pouvez créer une vraie API
      setUsers([
        { id: 1, login: 'admin', first_name: 'Administrateur' },
        { id: 2, login: 'user1', first_name: 'Utilisateur 1' },
      ]);
    } catch (error) {
      console.error('Erreur users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        cout_estime: formData.cout_estime ? parseFloat(formData.cout_estime) : null,
        temps_passe_heures: formData.temps_passe_heures ? parseFloat(formData.temps_passe_heures) : null,
        responsable_id: formData.responsable_id || null,
        date_echeance: formData.date_echeance || null,
      };

      if (dossier) {
        await api.put(`/dossiers/${dossier.id}`, payload);
      } else {
        await api.post('/dossiers', payload);
      }

      onDossierSaved();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du dossier');
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id == formData.client_id);
  const selectedStatus = DOSSIER_STATUS.find(s => s.value === formData.status);
  const selectedPriorite = PRIORITES.find(p => p.value === formData.priorite);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {dossier ? 'Modifier le dossier' : 'Nouveau dossier'}
          {selectedStatus && (
            <Chip label={selectedStatus.label} color={selectedStatus.color} size="small" />
          )}
          {selectedPriorite && formData.priorite !== 'normale' && (
            <Chip label={`Priorité ${selectedPriorite.label}`} color={selectedPriorite.color} size="small" />
          )}
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Ligne 1 : Client et ID Dossier */}
            <Grid item xs={12} md={6}>
              <TextField
                name="client_id"
                label="Client"
                value={formData.client_id}
                onChange={handleChange}
                select
                fullWidth
                required
                margin="normal"
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name} - {client.email}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="id_dossier"
                label="ID Dossier"
                value={formData.id_dossier}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                helperText="Identifiant unique du dossier"
              />
            </Grid>

            {/* Ligne 2 : Status et Type */}
            <Grid item xs={12} md={6}>
              <TextField
                name="status"
                label="Statut"
                value={formData.status}
                onChange={handleChange}
                select
                fullWidth
                margin="normal"
              >
                {DOSSIER_STATUS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="type_dossier"
                label="Type de dossier"
                value={formData.type_dossier}
                onChange={handleChange}
                select
                fullWidth
                margin="normal"
              >
                {DOSSIER_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Ligne 3 : Priorité et Responsable */}
            <Grid item xs={12} md={6}>
              <TextField
                name="priorite"
                label="Priorité"
                value={formData.priorite}
                onChange={handleChange}
                select
                fullWidth
                margin="normal"
              >
                {PRIORITES.map((priorite) => (
                  <MenuItem key={priorite.value} value={priorite.value}>
                    {priorite.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="responsable_id"
                label="Responsable"
                value={formData.responsable_id}
                onChange={handleChange}
                select
                fullWidth
                margin="normal"
              >
                <MenuItem value="">Non assigné</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.first_name || user.login}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Ligne 4 : Sujet */}
            <Grid item xs={12}>
              <TextField
                name="sujet"
                label="Sujet"
                value={formData.sujet}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                placeholder="Résumé du problème ou de la demande"
              />
            </Grid>

            {/* Ligne 5 : Description */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description détaillée"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
                placeholder="Description complète du dossier..."
              />
            </Grid>

            {/* Ligne 6 : Dates et Coût */}
            <Grid item xs={12} md={6}>
              <TextField
                name="date_echeance"
                label="Date d'échéance"
                type="date"
                value={formData.date_echeance}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="cout_estime"
                label="Coût estimé (€)"
                type="number"
                value={formData.cout_estime}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>

            {/* Ligne 7 : Temps passé et Documents */}
            {dossier && (
              <Grid item xs={12} md={6}>
                <TextField
                  name="temps_passe_heures"
                  label="Temps passé (heures)"
                  type="number"
                  value={formData.temps_passe_heures}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  inputProps={{ step: "0.25", min: "0" }}
                />
              </Grid>
            )}
            <Grid item xs={12} md={dossier ? 6 : 12}>
              <TextField
                name="document_url"
                label="Lien vers document"
                value={formData.document_url}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="https://..."
              />
            </Grid>

            {/* Ligne 8 : Remarques */}
            <Grid item xs={12}>
              <TextField
                name="remarques"
                label="Remarques"
                value={formData.remarques}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                placeholder="Notes internes, commentaires..."
              />
            </Grid>

            {/* Informations client sélectionné */}
            {selectedClient && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    📞 Client sélectionné: {selectedClient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📧 {selectedClient.email} • 📱 {selectedClient.phone}
                  </Typography>
                </Box>
              </Grid>
            )}
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