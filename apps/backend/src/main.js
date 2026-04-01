/**
 * @file Entry point utama untuk aplikasi Backend.
 * Dikonfigurasi untuk mendukung Vercel Serverless Functions dan Local Development.
 */

import "dotenv/config";
import { web } from "./application/web.js";
import { logger } from "./application/logger.js";

/**
 * Port server aplikasi yang diambil dari environment variable atau default ke 3000.
 * @type {number}
 */
const PORT = Number(process.env.PORT) || 3000;

/**
 * Menjalankan server (listen) hanya jika berada di local development.
 * Di Vercel (production), instance dieksekusi secara serverless tanpa `listen`.
 */
if (process.env.NODE_ENV !== "production") {
  web.listen(PORT, () => {
    logger.info(`Aplikasi berjalan di port: ${PORT}`);
  });
}

/**
 * Mengekspor instance aplikasi Express.
 * Sangat dibutuhkan oleh Vercel agar aplikasi dapat berjalan sebagai Serverless Function.
 * * @type {import('express').Express}
 */
export default web;