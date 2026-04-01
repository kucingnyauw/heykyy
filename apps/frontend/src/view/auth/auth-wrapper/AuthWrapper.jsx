import React, { useMemo } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

// --- Styled Components ---

const AuthWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
  overflow: "hidden",
}));

const StarField = styled(motion.div)(({ theme }) => ({
  position: "absolute",
  inset: 0,
  background:
    theme.palette.background.default,
  zIndex: 0,
}));

const ContentContainer = styled(motion.div)({
  position: "relative",
  zIndex: 2,
  width: "100%",
  display: "flex",
  justifyContent: "center",
});

// --- Sub-Komponen Bintang ---

const Stars = () => {
  // Menggunakan useMemo agar posisi bintang tidak berubah-ubah saat re-render
  const stars = useMemo(() => {
    return [...Array(70)].map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0.1, scale: 0.5 }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            backgroundColor: "#fff",
            borderRadius: "50%",
            boxShadow: "0 0 5px rgba(255, 255, 255, 0.3)", // Efek glow lembut
          }}
        />
      ))}
    </>
  );
};

// --- Komponen Utama ---

const AuthWrapperAnimated = ({ children }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <AuthWrapper>
      {/* Latar Belakang Bintang (Hanya muncul di Dark Mode) */}
      {isDark && (
        <StarField
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <Stars />
        </StarField>
      )}

      {/* Animasi Konten (Form Login/Register) */}
      <ContentContainer
       
      >
        {children}
      </ContentContainer>
    </AuthWrapper>
  );
};

export default AuthWrapperAnimated;