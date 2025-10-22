import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // ✅ AJOUTEZ CET IMPORT
import api from "../api";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function Dossiers() {
  const [dossiers, setDossiers] = useState([]);
  // const [search, setSearch] = useState("");
  // const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [searchParams] = useSearchParams(); // ✅ AJOUTEZ CETTE LIGNE
  const clientId = searchParams.get('client'); // ✅ RÉCUPÈRE L'ID CLIENT

  const fetchDossiers = async () => {
    try {
      const response = await api.get("/dossiers");
      let dossiersData = response.data;
      
      // ✅ FILTRER PAR CLIENT SI SPÉCIFIÉ
      if (clientId) {
        dossiersData = dossiersData.filter(d => d.client_id === clientId);
      }
      
      setDossiers(dossiersData);
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers:", error);
      // setSnackbar({
      //   open: true,
      //   message: "Impossible de charger les dossiers.",
      // });
    }
  };

  useEffect(() => {
    fetchDossiers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Désactive l'erreur pour cette ligne

  const getStatusColor = (status) => {
    switch (status) {
      case 'actif': return 'success';
      case 'en_cours': return 'warning';
      case 'fermé': return 'error';
      default: return 'default';
    }
  };

  const filteredDossiers = dossiers;

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}>
          🗂️ Gestion des Dossiers Clients
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            {dossiers.length} dossiers trouvés
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: "#1976d2", color: "#fff" }}
          >
            Nouveau Dossier
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>ID Dossier</strong></TableCell>
                <TableCell><strong>Client</strong></TableCell>
                <TableCell><strong>Sujet</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Priorité</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDossiers.map((dossier) => (
                <TableRow key={dossier.id} hover>
                  <TableCell>{dossier.id_dossier}</TableCell>
                  <TableCell>{dossier.client_name}</TableCell>
                  <TableCell>{dossier.sujet}</TableCell>
                  <TableCell>{dossier.type_dossier}</TableCell>
                  <TableCell>
                    <Chip 
                      label={dossier.status} 
                      color={getStatusColor(dossier.status)}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={dossier.priorite} 
                      color={dossier.priorite === 'haute' ? 'error' : 'default'}
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}