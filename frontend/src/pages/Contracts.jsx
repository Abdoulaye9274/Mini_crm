import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [open, setOpen] = useState(false);
  const [newContract, setNewContract] = useState({ client_id: "", ref: "", amount: "", start_date: "", end_date: "", status: "en_cours" });

  const fetchContracts = async () => {
    const res = await api.get("/contracts");
    setContracts(res.data);
  };

  useEffect(() => { fetchContracts(); }, []);

  const handleSave = async () => {
    await api.post("/contracts", newContract);
    fetchContracts();
    setOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Contrats</Typography>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        + Nouveau contrat
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Référence</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Montant</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Dates</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contracts.map(c => (
            <TableRow key={c.id}>
              <TableCell>{c.ref}</TableCell>
              <TableCell>{c.client_name}</TableCell>
              <TableCell>{c.amount} €</TableCell>
              <TableCell>{c.status}</TableCell>
              <TableCell>{c.start_date} → {c.end_date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog pour créer un contrat */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Créer un contrat</DialogTitle>
        <DialogContent>
          <TextField label="ID Client" fullWidth margin="dense" value={newContract.client_id} onChange={e => setNewContract({...newContract, client_id: e.target.value})} />
          <TextField label="Référence" fullWidth margin="dense" value={newContract.ref} onChange={e => setNewContract({...newContract, ref: e.target.value})} />
          <TextField label="Montant (€)" fullWidth margin="dense" type="number" value={newContract.amount} onChange={e => setNewContract({...newContract, amount: e.target.value})} />
          <TextField label="Date de début" fullWidth margin="dense" type="date" InputLabelProps={{ shrink: true }} value={newContract.start_date} onChange={e => setNewContract({...newContract, start_date: e.target.value})} />
          <TextField label="Date de fin" fullWidth margin="dense" type="date" InputLabelProps={{ shrink: true }} value={newContract.end_date} onChange={e => setNewContract({...newContract, end_date: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
