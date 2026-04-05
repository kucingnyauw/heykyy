import PropTypes from "prop-types";
import { Avatar } from "@mui/material";
import { Size } from "@heykyy/theme";

const AVATAR_SIZE_MAP = {
  extraSmall: Size.spacing[8],
  small: Size.spacing[9],
  medium: Size.spacing[10],
  large: Size.spacing[12],
  extraLarge: Size.spacing[14],
};

/**
 * A reusable Avatar component that displays a user's profile image or falls back
 * to generated initials using ui-avatars.com if no image URL is provided.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.profileUrl] - The URL of the user's profile image.
 * @param {string} [props.displayName="User"] - The user's full name, used for generating fallback initials and alt text.
 * @param {('extraSmall'|'small'|'medium'|'large'|'extraLarge')} [props.size="medium"] - The size of the avatar.
 * @param {Function} [props.onClick] - Optional click handler for interactivity.
 */
export const AppProfileAvatar = ({
  profileUrl,
  displayName = "user",
  size = "medium",
  onClick,
  ...props
}) => {
  const getAvatarUrl = () => {
    if (profileUrl && profileUrl.length > 0) {
      return profileUrl;
    }
    const nameParts = displayName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      firstName
    )}+${encodeURIComponent(lastName)}&background=random&color=fff`;
  };

  const finalSize = AVATAR_SIZE_MAP[size] || AVATAR_SIZE_MAP.medium;
  const clickable = typeof onClick === "function";

  const avatarSx = {
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
  };

  return (
    <Avatar
      src={getAvatarUrl()}
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
  size: PropTypes.oneOf([
    "extraSmall",
    "small",
    "medium",
    "large",
    "extraLarge",
  ]),
  onClick: PropTypes.func,
};