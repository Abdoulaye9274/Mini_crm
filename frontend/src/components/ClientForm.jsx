import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import api from "../api";

export default function ClientForm({ onClientAdded }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    await api.post("/clients", form);
    setOpen(false);
    setForm({ name: "", email: "", phone: "" });
    onClientAdded();
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Ajouter Client
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Ajouter un client</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Nom" name="name" fullWidth value={form.name} onChange={handleChange} />
          <TextField margin="dense" label="Email" name="email" fullWidth value={form.email} onChange={handleChange} />
          <TextField margin="dense" label="Téléphone" name="phone" fullWidth value={form.phone} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
