import crypto from "crypto";

export class IpUtils {
  static getClientIp(req) {
    let ip =
      req.headers["cf-connecting-ip"] || 
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      req.ip;

  
    if (ip?.startsWith("::ffff:")) {
      ip = ip.substring(7);
    }

    return ip || "0.0.0.0";
  }

  static hashIp(ip) {
    return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
  }
}
