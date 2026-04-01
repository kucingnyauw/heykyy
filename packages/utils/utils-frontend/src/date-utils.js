import { DEFAULT_LOCALE, DEFAULT_TIMEZONE } from "@heykyy/constant";

export class DateUtils {
  static _parse(date, method) {
    if (date == null) return null;

    const d = new Date(date);
    if (isNaN(d.getTime())) {
      throw new Error(`DateUtils.${method}: Invalid date input (${date})`);
    }

    return d;
  }

  static formatDate(date, options = {}) {
    const d = this._parse(date, "formatDate");
    if (!d) return null;

    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      timeZone: DEFAULT_TIMEZONE,
      year: "numeric",
      month: "long",
      day: "2-digit",
      ...options,
    }).format(d);
  }

  static formatDateTime(date, options = {}) {
    const d = this._parse(date, "formatDateTime");
    if (!d) return null;

    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      timeZone: DEFAULT_TIMEZONE,
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      ...options,
    }).format(d);
  }

  static formatTime(date, options = {}) {
    const d = this._parse(date, "formatTime");
    if (!d) return null;

    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      timeZone: DEFAULT_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    }).format(d);
  }

  static formatShortDate(date, options = {}) {
    const d = this._parse(date, "formatShortDate");
    if (!d) return null;

    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      timeZone: DEFAULT_TIMEZONE,
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    }).format(d);
  }

  static relativeTime(from, to = new Date()) {
    const fromDate = this._parse(from, "relativeTime(from)");
    const toDate = this._parse(to, "relativeTime(to)");

    if (!fromDate || !toDate) return null;

    const diff = toDate.getTime() - fromDate.getTime();

    const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, {
      numeric: "auto",
    });

    const units = [
      { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
      { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
      { unit: "day", ms: 1000 * 60 * 60 * 24 },
      { unit: "hour", ms: 1000 * 60 * 60 },
      { unit: "minute", ms: 1000 * 60 },
      { unit: "second", ms: 1000 },
    ];

    for (const { unit, ms } of units) {
      const value = Math.round(diff / ms);
      if (Math.abs(value) >= 1) {
        return rtf.format(value, unit);
      }
    }

    return rtf.format(0, "second");
  }

  static toISODate(date) {
    const d = this._parse(date, "toISODate");
    if (!d) return null;

    return d.toISOString().split("T")[0];
  }

  static isValid(date) {
    if (date == null) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
  }

  static formatTimeAgo(date, locale = "en") {
    const d = this._parse(date, "formatTimeAgo");
    if (!d) return null;

    const now = Date.now();
    const diffMs = d.getTime() - now;
    const diffSeconds = Math.round(diffMs / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    const MIN = 60;
    const HOUR = 60 * 60;
    const DAY = 60 * 60 * 24;
    const MONTH = 60 * 60 * 24 * 30;
    const YEAR = 60 * 60 * 24 * 365;

    if (Math.abs(diffSeconds) < 5) return "just now";
    if (Math.abs(diffSeconds) < MIN)
      return rtf.format(diffSeconds, "second");
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

  static greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }
}