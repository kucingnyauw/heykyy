import { AsyncHandler } from "../utils/index.js";
import CertificateService from "../service/certificate-service.js";

/**
 * Controller class for managing professional credentials and certifications.
 * Handles metadata and multi-asset (image/PDF) processing.
 */
class CertificateController {
  /**
   * Creates a new certificate entry.
   * Extracts images and documents from the processed assets middleware.
   */
  create = AsyncHandler.catch(async (req, res) => {
    const userId = req.user.id;
    const assets = req.assets || [];

    const image =
      assets.find((file) => file.mimeType.startsWith("image/")) || null;
    const doc =
      assets.find((file) => file.mimeType === "application/pdf") || null;

    const result = await CertificateService.create(
      userId,
      req.body,
      image,
      doc
    );

    res.status(201).json({
      success: true,
      message: "Professional certificate has been successfully registered.",
      data: result,
    });
  });

  /**
   * Updates an existing certificate.
   * Handles optional replacement of image or PDF document.
   */
  update = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;
    const assets = req.assets || [];

    const image =
      assets.find((file) => file.mimeType.startsWith("image/")) || null;
    const doc =
      assets.find((file) => file.mimeType === "application/pdf") || null;

    const result = await CertificateService.update(id, req.body, image, doc);

    res.status(200).json({
      success: true,
      message: "Certificate record has been successfully updated.",
      data: result,
    });
  });

  /**
   * Removes a certificate and its associated cloud storage assets.
   */
  delete = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;

    await CertificateService.delete(id);

    res.status(200).json({
      success: true,
      message: "Certificate and associated files have been removed.",
    });
  });

  /**
   * Retrieves a single certificate detail.
   */
  get = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;

    const result = await CertificateService.get(id);

    res.status(200).json({
      success: true,
      message: "Certificate details retrieved successfully.",
      data: result,
    });
  });

  /**
   * Retrieves a paginated list of certificates.
   */
  gets = AsyncHandler.catch(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const year = req.query.year;
    const sortBy = req.query.sortBy;
  
    const result = await CertificateService.gets(
      page, 
      limit, 
      search, 
      year, 
      sortBy
    );
  
    res.status(200).json({
      success: true,
      message: "Certificate collection retrieved successfully.",
      data: result.data,
      metadata: result.metadata,
    });
  });
}

export default new CertificateController();
