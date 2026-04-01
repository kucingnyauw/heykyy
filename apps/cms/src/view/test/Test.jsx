import React, { useState } from "react";
import { Box, Typography, Chip, Stack, Button } from "@mui/material";
import SocialListDialog from "../../ui-components/SocialsList";

const TestView = () => {
  const [open, setOpen] = useState(false);
  const [social, setSocial] = useState({});

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Selected Social
      </Typography>

      {social?.id ? (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={social.name}
            onDelete={() => setSocial({})}
          />
        </Stack>
      ) : (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No social selected
        </Typography>
      )}

      <Button variant="contained" onClick={() => setOpen(true)}>
        Select Social
      </Button>

      <SocialListDialog
        open={open}
        onClose={() => setOpen(false)}
        value={social}
        onChange={setSocial}
      />
    </Box>
  );
};

export default TestView;
