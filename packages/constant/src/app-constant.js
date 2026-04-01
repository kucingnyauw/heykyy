export const MAX_USAGE = 5;
export const MAX_DELAY = 24 * 60 * 60;
export const Z_INDEX_APPBAR = 1100;
export const Z_INDEX_NAVIGATION_BAR = 999;
export const HEIGHT_APPBAR = 58;
export const HEIGHT_NAVIGATION_BAR = 0;
export const SIDEBAR_WIDTH_EXPANDED = 260;
export const SIDEBAR_WIDTH_COLLAPSED = 70;
export const DRAWER_WIDTH = 260;


/** * Timeout unit is in milliseconds (ms)
 */

/** 5 minutes (300 seconds * 1000) */
export const FILE_TIMEOUT = 300000; 

/** 5 minutes (300 seconds * 1000) */
export const AI_TIMEOUT = 300000; 

/** 1 minute (60 seconds * 1000) */
export const STANDARD_TIMEOUT = 60000;

export const DEFAULT_LOCALE = "id-ID";
export const DEFAULT_TIMEZONE = "Asia/Jakarta";

export const MAX_UPLOAD = 10;
export const MAX_SIZE = {
  video: 15 * 1024 * 1024,
  document: 10 * 1024 * 1024,
  image: 5 * 1024 * 1024,
};

export const ALLOWED_FILE = {
  image: ["image/jpeg", "image/png", "image/webp"],
  docs: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
  ],
  video: ["video/mp4", "video/mpeg", "video/quicktime"],
};
