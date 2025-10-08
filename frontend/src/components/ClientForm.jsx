import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import api from "../api";

export default function ClientForm({ open, onClose, onClientSaved, client }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (client) {
      setForm({ name: client.name || "", email: client.email || "", phone: client.phone || "" });
    } else {
      setForm({ name: "", email: "", phone: "" });
    }
  }, [client]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      if (client) {
        await api.put(`/clients/${client.id}`, form);
      } else {
        await api.post("/clients", form);
      }
      setForm({ name: "", email: "", phone: "" });
      onClientSaved();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{client ? "Modifier le client" : "Ajouter un client"}</DialogTitle>
      <DialogContent>
        <TextField margin="dense" label="Nom" name="name" fullWidth value={form.name} onChange={handleChange} />
        <TextField margin="dense" label="Email" name="email" fullWidth value={form.email} onChange={handleChange} />
        <TextField margin="dense" label="Téléphone" name="phone" fullWidth value={form.phone} onChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained">
          {client ? "Modifier" : "Ajouter"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
