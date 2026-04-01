import { AsyncHandler } from "@heykyy/utils-backend";
import { getPrisma } from "../application/database.js";
import { redis } from "../lib/redis.js";

/**
 * Controller class managing application health and status checks.
 * Useful for load balancers, uptime monitoring tools, and infrastructure checks.
 */
class HealthController {
  /**
   * Basic health check endpoint.
   * Responds immediately to indicate the Node.js server is running.
   */
  check = AsyncHandler.catch(async (req, res) => {
    res.status(200).json({
      success: true,
      message: "The server is healthy and operational.",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || "v1",
    });
  });

  /**
   * Detailed health check endpoint.
   * Verifies the connection to critical infrastructure like the Database and Redis.
   */
  detailed = AsyncHandler.catch(async (req, res) => {
    const healthStatus = {
      server: "OK",
      database: "DISCONNECTED",
      redis: "DISCONNECTED",
      timestamp: new Date().toISOString(),
    };

    let isHealthy = true;

    try {
      /** Check Database Connection */
      const prisma = getPrisma();
      await prisma.$queryRaw`SELECT 1`;
      healthStatus.database = "OK";
    } catch (error) {
      healthStatus.database = "ERROR";
      isHealthy = false;
    }

    try {
      /** Check Redis Connection */
      const redisPing = await redis.ping();
      if (redisPing === "PONG") {
        healthStatus.redis = "OK";
      } else {
        throw new Error("Redis did not respond with PONG");
      }
    } catch (error) {
      healthStatus.redis = "ERROR";
      isHealthy = false;
    }

    /** * If any infrastructure is down, return a 503 Service Unavailable,
     * otherwise return a 200 OK.
     */
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
      success: isHealthy,
      message: isHealthy
        ? "All systems are fully operational."
        : "One or more services are currently experiencing issues.",
      services: healthStatus,
    });
  });
}

export default new HealthController();