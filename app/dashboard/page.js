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
  Stack,
  CircularProgress
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter, useSearchParams } from "next/navigation";
import MapComponent from "@/components/MapComponent";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    let token = localStorage.getItem("token");

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      token = urlToken;

      window.history.replaceState({}, document.title, "/dashboard");
    }

    if (!token) {
      setLoading(false);
    } else {
      setIsAuthenticated(true);
      fetchTasks();
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, router]);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/tasks", {
        headers: { authorization: token }
      }).then(r => r.json());
      setTasks(res || []);
    } catch (e) {
      console.error("Failed to fetch tasks");
    }
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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Authentication Failed or Session Expired
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Please log in again to access your dashboard.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Redirecting to login...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={logout}
          sx={{ mb: 2 }}
        >
          Back to login
        </Button>
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

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Your Location
          </Typography>
          <MapComponent />
        </Box>
      </Paper>
    </Container>
  );
}
