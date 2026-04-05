import React, { useState } from "react";
import { CssBaseline, ThemeProvider, Box, Typography } from "@mui/material";
import { Share2 } from "lucide-react"; // Import icon untuk tombol share

import Home from "@view/home/Home";
import { getTheme } from "Theme";
import { IconButton } from "@heykyy/components";
import ShareDialog from "@ui/dialog/ShareDialog";

const App = () => {
  const theme = getTheme("light");
  
  // State untuk mengontrol visibilitas ShareDialog
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Kontainer untuk simulasi tombol di tengah layar */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          height: "100vh",
          gap: 2 
        }}
      >
        <Typography variant="h6">
          Klik tombol di bawah untuk mencoba Share Dialog
        </Typography>

        {/* Tombol pemicu */}
        <IconButton 
          icon={<Share2 size={20} />} 
          onClick={() => setIsShareOpen(true)} 
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": { bgcolor: "primary.dark" }
          }}
        />
      </Box>

      {/* Pemanggilan ShareDialog */}
      <ShareDialog 
        open={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        url="https://portofolio.heykyy.com/project/awesome-app" 
        title="Lihat project keren ini dari HeyKyy!" 
      />

    </ThemeProvider>
  );
};

export default App;