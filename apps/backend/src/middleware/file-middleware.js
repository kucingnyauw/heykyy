import multer from "multer";
import crypto from "crypto";
import { ApiError, sanitizeFileName } from "@heykyy/utils-backend";
import { getPrisma } from "../application/database.js";
import { ALLOWED_FILE, MAX_SIZE, MAX_UPLOAD } from "@heykyy/constant";

/**
 * Configure multer to use memory storage for temporary file handling.
 */
const storage = multer.memoryStorage();

/**
 * Maps file categories to their respective maximum allowed sizes.
 */
const typeSizeMap = {
  image: MAX_SIZE.image,
  docs: MAX_SIZE.document,
  video: MAX_SIZE.video,
};

/**
 * Identifies the file category based on the provided MIME type.
 * @param {string} mimetype - The MIME type of the file.
 * @returns {string|undefined}
 */
const getFileCategory = (mimetype) => {
  return Object.keys(ALLOWED_FILE).find((key) =>
    ALLOWED_FILE[key].includes(mimetype)
  );
};

/**
 * Processes an uploaded file by validating its checksum for duplicates,
 * verifying size constraints, and sanitizing its metadata.
 * @param {Object} file - The file object from multer.
 * @returns {Promise<Object>} Processed file metadata.
 * @throws {ApiError}
 */
export const processFile = async (file) => {
  const checksum = crypto
    .createHash("sha256")
    .update(file.buffer)
    .digest("hex");

  /** Check for duplicate files in the database using SHA-256 checksum */
  const exists = await getPrisma().asset.count({ where: { checksum } });
  if (exists > 0) {
    throw new ApiError(
      400,
      `The file "${file.originalname}" has already been uploaded. Duplicate content is not allowed.`
    );
  }

  const category = getFileCategory(file.mimetype);
  const maxSize = category ? typeSizeMap[category] : MAX_SIZE.document;

  if (file.size > maxSize) {
    const sizeInMB = (maxSize / (1024 * 1024)).toFixed(2);
    throw new ApiError(
      400,
      `The file "${file.originalname}" exceeds the size limit of ${sizeInMB} MB for this file type.`
    );
  }

  return {
    fileName: sanitizeFileName(file.originalname),
    buffer: file.buffer,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    checksum,
  };
};

/**
 * Middleware factory for handling multi-type file uploads.
 * @param {Array<"image"|"docs"|"video">} types - Allowed file categories.
 * @param {string} fieldName - The name of the multipart form field.
 * @returns {Array<import("express").RequestHandler>}
 */
export const uploadMultiType = (
  types = ["image", "docs"],
  fieldName = "file"
) => {
  const allAllowedMimes = types.flatMap((t) => ALLOWED_FILE[t] || []);

  const fileFilter = (req, file, cb) => {
    if (!allAllowedMimes.includes(file.mimetype)) {
      return cb(
        new ApiError(
          400,
          `The file format "${
            file.mimetype
          }" is not supported. Supported formats: ${allAllowedMimes.join(
            ", "
          )}.`
        )
      );
    }
    cb(null, true);
  };

  const maxFileSize = Math.max(...types.map((t) => typeSizeMap[t] || 0));

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
    },
  });

  return [
    MAX_UPLOAD === 1
      ? upload.single(fieldName)
      : upload.array(fieldName, MAX_UPLOAD),
    async (req, res, next) => {
      try {
        if (!req.file && (!req.files || req.files.length === 0)) {
          return next();
        }

        if (req.file) {
          req.asset = await processFile(req.file);
        } else if (req.files && req.files.length > 0) {
          req.assets = await Promise.all(req.files.map(processFile));
          if (req.assets.length > 0) {
            req.asset = req.assets[0];
          }
        }

        next();
      } catch (err) {
        next(err);
      }
    },
  ];
};
