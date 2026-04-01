/**
 * @typedef {Object} CertificateFileData
 * @property {string} url - The public URL of the certificate file.
 */

/**
 * @typedef {Object} CertificateData
 * @property {string} id
 * @property {string} title
 * @property {string} summary
 * @property {string} issuer
 * @property {number} year
 * @property {CertificateFileData} [file] - Associated asset file.
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * DTO for single certificate response.
 * Handles the mapping of the certificate model and its associated file asset.
 */
class CertificateDto {
  /**
   * @param {CertificateData} certificate
   */
  constructor(certificate) {
    this.id = certificate.id;
    this.title = certificate.title;
    this.summary = certificate.summary;
    this.issuer = certificate.issuer;
    this.year = certificate.year;

    this.file = certificate.file ? { url: certificate.file.url } : null;
    this.image = certificate.image ? { url: certificate.image.url } : null
    this.createdAt = certificate.createdAt;
    this.updatedAt = certificate.updatedAt;
  }
}

/**
 * DTO for certificate list response.
 * Standardizes the collection of certificates for API responses.
 */
class CertificateListDto {
  /**
   * @param {CertificateData[]} certificates
   */
  constructor(certificates) {
    /** @type {CertificateDto[]} */
    this.items = (certificates || []).map((cert) => new CertificateDto(cert));
  }
}

export { CertificateDto, CertificateListDto };
