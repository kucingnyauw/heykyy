import { useState, useEffect } from "react";

/**
 * Hook untuk menyimpan dan mengambil state dari localStorage dengan sinkronisasi otomatis.
 *
 * @template T
 * @param {string} key Kunci unik untuk penyimpanan di localStorage.
 * @param {T} defaultValue Nilai default jika tidak ada data di localStorage atau parsing gagal.
 *
 * @returns {[T, (value: T | ((prev: T) => T)) => void]} Tuple berisi nilai saat ini dan setter.
 */
export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
  }, [key, value]);

  return [value, setValue];
};