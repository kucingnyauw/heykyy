import { DEFAULT_LOCALE, DEFAULT_TIMEZONE } from "@heykyy/constant";

/**
 * Utility untuk manipulasi & formatting tanggal.
 * Berbasis Intl API (tanpa dependency eksternal).
 *
 * Design goals:
 * - Deterministic (timezone & locale konsisten)
 * - Fail-fast untuk input invalid
 * - Reusable di seluruh monorepo
 *
 * @class DateUtils
 */
export class DateUtils {
  /**
   * Parse input menjadi Date object yang valid.
   *
   * @private
   * @param {Date | string | number | null | undefined} input
   * @param {string} context
   * @returns {Date | null}
   * @throws {Error} jika invalid date
   */
  static _parse(input, context) {
    if (input == null) return null;

    const date = new Date(input);
    if (isNaN(date.getTime())) {
      throw new Error(`DateUtils.${context}: Invalid date input (${input})`);
    }

    return date;
  }

  /**
   * Internal formatter factory untuk menghindari duplikasi.
   *
   * @private
   */
  static _format(date, context, options) {
    const d = this._parse(date, context);
    if (!d) return null;

    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      timeZone: DEFAULT_TIMEZONE,
      ...options,
    }).format(d);
  }

  /**
   * Format tanggal lengkap (contoh: 02 April 2026)
   *
   * @param {Date | string | number} date
   * @param {Intl.DateTimeFormatOptions} [options]
   * @returns {string | null}
   */
  static formatDateLong(date, options = {}) {
    return this._format(date, "formatDateLong", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      ...options,
    });
  }

  /**
   * Format tanggal pendek (contoh: 2 Apr 2026)
   */
  static formatDateShort(date, options = {}) {
    return this._format(date, "formatDateShort", {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    });
  }

  /**
   * Format waktu saja (HH:mm)
   */
  static formatTime(date, options = {}) {
    return this._format(date, "formatTime", {
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    });
  }

  /**
   * Format tanggal + waktu lengkap
   */
  static formatDateTime(date, options = {}) {
    return this._format(date, "formatDateTime", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      ...options,
    });
  }

  /**
   * Format ke ISO date (YYYY-MM-DD)
   */
  static toISODate(date) {
    const d = this._parse(date, "toISODate");
    if (!d) return null;
    return d.toISOString().split("T")[0];
  }

  /**
   * Validasi apakah input adalah tanggal valid
   */
  static isValidDate(input) {
    if (input == null) return false;
    const d = new Date(input);
    return !isNaN(d.getTime());
  }

  /**
   * Relative time (contoh: "2 days ago", "in 3 hours")
   *
   * @param {Date | string | number} from
   * @param {Date | string | number} [to]
   */
  static formatRelativeTime(from, to = new Date()) {
    const fromDate = this._parse(from, "formatRelativeTime(from)");
    const toDate = this._parse(to, "formatRelativeTime(to)");

    if (!fromDate || !toDate) return null;

    const diff = toDate.getTime() - fromDate.getTime();

    const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, {
      numeric: "auto",
    });

    const units = [
      ["year", 1000 * 60 * 60 * 24 * 365],
      ["month", 1000 * 60 * 60 * 24 * 30],
      ["day", 1000 * 60 * 60 * 24],
      ["hour", 1000 * 60 * 60],
      ["minute", 1000 * 60],
      ["second", 1000],
    ];

    for (const [unit, ms] of units) {
      const value = Math.round(diff / ms);
      if (Math.abs(value) >= 1) {
        return rtf.format(value, unit);
      }
    }

    return rtf.format(0, "second");
  }

  /**
   * Relative time dengan threshold UX (contoh: "just now")
   */
  static formatTimeAgo(date, locale = DEFAULT_LOCALE) {
    const d = this._parse(date, "formatTimeAgo");
    if (!d) return null;

    const diffSeconds = Math.round((d.getTime() - Date.now()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, {
      numeric: "auto",
    });

    const MIN = 60;
    const HOUR = 3600;
    const DAY = 86400;
    const MONTH = 2592000;
    const YEAR = 31536000;

    if (Math.abs(diffSeconds) < 5) return "just now";
    if (Math.abs(diffSeconds) < MIN) return rtf.format(diffSeconds, "second");
    if (Math.abs(diffSeconds) < HOUR)
      return rtf.format(Math.round(diffSeconds / MIN), "minute");
    if (Math.abs(diffSeconds) < DAY)
      return rtf.format(Math.round(diffSeconds / HOUR), "hour");
    if (Math.abs(diffSeconds) < MONTH)
      return rtf.format(Math.round(diffSeconds / DAY), "day");
    if (Math.abs(diffSeconds) < YEAR)
      return rtf.format(Math.round(diffSeconds / MONTH), "month");

    return rtf.format(Math.round(diffSeconds / YEAR), "year");
  }

  /**
   * Greeting berbasis waktu lokal
   */
  static getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }
}
