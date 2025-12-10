"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({

  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#ff0000",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
            color: "#cc0000",
          },
        },
      },
    },
  },
});

export default function ThemeRegistry({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
