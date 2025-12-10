"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      fetchTasks();
    }
    
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    const res = await fetch("/api/tasks", {
      headers: { authorization: token }
    }).then(r => r.json());

    setTasks(res || []);
  };

  const addTask = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    if (!title?.trim()) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: token
      },
      body: JSON.stringify({ title })
    });

    setTitle("");
    fetchTasks();
  };

  const removeTask = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: { authorization: token }
    });

    fetchTasks();
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Your Tasks
          </Typography>
          <Button variant="outlined" startIcon={<LogoutIcon />} onClick={logout}>
            Logout
          </Button>
        </Stack>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="New task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={addTask}>
            Add
          </Button>
        </Box>

        <Paper variant="outlined" sx={{ p: 1 }}>
          <List>
            {tasks.length === 0 && (
              <ListItem>
                <ListItemText primary="No tasks yet" />
              </ListItem>
            )}
            {tasks.map((t) => (
              <ListItem key={t._id} secondaryAction={
                <IconButton edge="end" onClick={() => removeTask(t._id)} aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              }>
                <ListItemText primary={t.title} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Paper>
    </Container>
  );
}
