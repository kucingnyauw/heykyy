import { Link as RouterLink } from "react-router-dom";

import { Box, Stack, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{mt : 8}}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
      >
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} All rights reserved{" "}
          <Link
            component={RouterLink}
            to="/"
            underline="none"
            sx={{
              color: "primary.main",
              fontWeight: 500,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            heykyy
          </Link>
        </Typography>

        <Stack direction="row" gap={2}>
          <Link
            component={RouterLink}
            to="/github"
            underline="hover"
            variant="caption"
            color="text.primary"
          >
            GitHub
          </Link>

          <Link
            component={RouterLink}
            to="/figma"
            underline="hover"
            variant="caption"
            color="text.primary"
          >
            Figma
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}