import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Hook untuk mencegah navigasi ketika terdapat perubahan yang belum disimpan.
 *
 * @param {boolean} shouldBlock Menentukan apakah navigasi harus diblokir.
 *
 * @returns {{ markAsSaved: () => void }} Objek dengan fungsi untuk menandai bahwa perubahan sudah disimpan.
 */
export function useUnsavedGuard(shouldBlock) {
  const isConfirmedRef = useRef(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      if (!shouldBlock || isConfirmedRef.current) return false;
      return currentLocation.pathname !== nextLocation.pathname;
    },
    [shouldBlock]
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;

    const timer = setTimeout(() => {
      const isConfirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );

      if (isConfirmed) {
        isConfirmedRef.current = true;
        if (blocker.state === "blocked") {
          blocker.proceed();
        }
        return;
      }

      if (blocker.state === "blocked") {
        blocker.reset();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [blocker]);

  /**
   * Menandai bahwa perubahan telah disimpan sehingga navigasi tidak lagi diblokir.
   *
   * @returns {void}
   */
  const markAsSaved = () => {
    isConfirmedRef.current = true;
  };

  return { markAsSaved };
}