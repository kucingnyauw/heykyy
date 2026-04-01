import React, { Suspense } from "react";
import { createPortal } from "react-dom";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

/**
 * Komponen Loader global yang menampilkan progress bar (LinearProgress)
 * di bagian paling atas layar dengan z-index tinggi.
 * Digunakan sebagai fallback UI saat komponen lazy sedang dimuat.
 * * @component
 */
function Loader() {
  return createPortal(
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: (theme) => theme.zIndex.modal + 10, // aman di atas semua
      }}
    >
      <LinearProgress />
    </Box>,
    document.body
  );
}

/**
 * Higher-Order Component (HOC) untuk membungkus komponen dengan `React.Suspense`.
 * Memungkinkan pemuatan komponen secara lazy (Lazy Loading) dengan menampilkan
 * indikator loading (`Loader`) selama proses pengambilan bundle chunk.
 * * @param {React.ComponentType} Component - Komponen React yang akan di-load (biasanya hasil dari React.lazy).
 * @returns {React.ComponentType} Komponen baru yang telah dibungkus dengan Suspense.
 */
export const AppLoadable = (Component) => {
  const WrappedComponent = (props) => (
    <Suspense fallback={<Loader />}>
      <Component {...props} />
    </Suspense>
  );

  return WrappedComponent;
};
