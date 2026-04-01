import { AsyncHandler } from "@heykyy/utils-backend";
import UserService from "../service/user-service.js";

/**
 * Controller class managing user-specific operations and identity.
 * Handles profile retrieval and metadata updates for the authenticated session.
 */
class UserController {
  /**
   * Retrieves the profile data of the currently authenticated user.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  me = AsyncHandler.catch(async (req, res) => {
    const result = await UserService.getCurrentUser(req.user);

    res.status(200).json({
      success: true,
      message: "User profile data retrieved successfully.",
      data: result,
    });
  });

  /**
   * Updates the authenticated user's profile information and avatar.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  update = AsyncHandler.catch(async (req, res) => {
    const file = req.asset;

    const result = await UserService.updateUser(
      req.user.id,
      req.body,
      file
    );

    res.status(200).json({
      success: true,
      message: "User profile has been successfully updated.",
      data: result,
    });
  });

  /**
   * Retrieves chronological activity logs for the authenticated user.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  activity = AsyncHandler.catch(async (req, res) => {
    const userId = req.user?.id;

    const result = await UserService.getUserActivity(userId);

    res.status(200).json({
      success: true,
      message: "User activity logs retrieved successfully.",
      data: result
    });
  });
}

export default new UserController();