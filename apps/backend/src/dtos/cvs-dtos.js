/**
 * @typedef {Object} CvFileData
 * @property {string} id - The unique identifier of the file asset.
 * @property {string} url - The public access URL of the CV file.
 */

/**
 * @typedef {Object} CvData
 * @property {string} id
 * @property {string} title
 * @property {boolean} isMain
 * @property {CvFileData} [file] - Associated PDF/Document asset.
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Data Transfer Object for CV (Curriculum Vitae) responses.
 * Standardizes the delivery of CV metadata and its associated file asset.
 */
class CvDto {
  /**
   * @param {CvData} cv - Raw prisma CV object.
   */
  constructor(cv) {
    this.id = cv.id;
    this.title = cv.title;
    this.isMain = cv.isMain || false;

    /** @type {CvFileData|null} */
    this.file = cv.file
      ? {
          url: cv.file.url,
        }
      : null;

    this.createdAt = cv.createdAt;
    this.updatedAt = cv.updatedAt;
  }
}

/**
 * Collection DTO for grouping multiple CvDto objects.
 */
class CvListDto {
  /**
   * @param {CvData[]} cvs - Array of prisma CV objects.
   */
  constructor(cvs) {
    /** @type {CvDto[]} */
    this.items = (cvs || []).map((cv) => new CvDto(cv));
  }
}

export { CvDto, CvListDto };
