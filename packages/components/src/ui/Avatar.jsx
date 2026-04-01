import { useMemo } from "react";
import PropTypes from "prop-types";
import { Avatar } from "@mui/material";

/**
 * Global configuration for predefined avatar sizes.
 */
const AVATAR_SIZE_MAP = {
  small: 32,
  medium: 40,
  large: 56,
  extraLarge: 80,
};

/**
 * A reusable Avatar component that displays a user's profile image or falls back
 * to generated initials using ui-avatars.com if no image URL is provided.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.profileUrl] - The URL of the user's profile image.
 * @param {string} [props.displayName="User"] - The user's full name, used for generating fallback initials and alt text.
 * @param {('small'|'medium'|'large'|'extraLarge'|number)} [props.size="medium"] - The size of the avatar.
 * @param {Function} [props.onClick] - Optional click handler for interactivity.
 */
export const AppProfileAvatar = ({
  profileUrl,
  displayName = "User",
  size = "medium",
  onClick,
  ...props
}) => {
  const avatarUrl = useMemo(() => {
    if (profileUrl && profileUrl.length > 0) {
      return profileUrl;
    }
    const nameParts = displayName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      firstName
    )}+${encodeURIComponent(lastName)}&background=random&color=fff`;
  }, [profileUrl, displayName]);

  const finalSize = useMemo(() => {
    return typeof size === "number"
      ? `${size}px`
      : AVATAR_SIZE_MAP[size] || AVATAR_SIZE_MAP.medium;
  }, [size]);

  const clickable = typeof onClick === "function";

  const avatarSx = useMemo(
    () => ({
      width: finalSize,
      height: finalSize,
      fontSize: "0.45em",
      cursor: clickable ? "pointer" : "default",
      transition: "all 0.2s ease",
      "&:hover": clickable
        ? {
            opacity: 0.85,
          }
        : undefined,
      "&:active": clickable
        ? {
            transform: "scale(0.96)",
          }
        : undefined,
    }),
    [finalSize, clickable]
  );

  return (
    <Avatar
      src={avatarUrl}
      alt={displayName}
      onClick={onClick}
      sx={avatarSx}
      {...props}
    />
  );
};

AppProfileAvatar.propTypes = {
  profileUrl: PropTypes.string,
  displayName: PropTypes.string,
  size: PropTypes.oneOfType([
    PropTypes.oneOf(["small", "medium", "large", "extraLarge"]),
    PropTypes.number,
  ]),
  onClick: PropTypes.func,
};