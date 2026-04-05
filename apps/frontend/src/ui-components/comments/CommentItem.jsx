/**
 * @fileoverview Komponen CommentItem untuk menampilkan hierarki komentar.
 * Mendukung balasan multi-level (nested), di mana balasan dari balasan (level 2+) 
 * tidak akan bergeser lagi ke kanan dan tetap sejajar dengan level 1.
 */

import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Collapse, useTheme, alpha, Stack } from "@mui/material";
import { SendHorizonal, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import {
  AppProfileAvatar,
  AppPopper,
  IconButton,
  AppInput,
} from "@heykyy/components";

/**
 * Komponen reusable untuk menampilkan item komentar secara individual.
 *
 * @component
 * @param {Object} props - Properti komponen.
 * @param {Object} props.item - Data objek komentar.
 * @param {string|number} props.item.id - ID unik komentar.
 * @param {string} props.item.content - Isi teks komentar.
 * @param {Object} props.item.timestamps - Objek waktu (misal: createdAt).
 * @param {Object} props.item.author - Objek pembuat komentar (name, avatar, bio).
 * @param {Array} [props.item.replies] - Daftar balasan untuk komentar ini.
 * @param {number} [props.level=0] - Kedalaman level komentar untuk mengatur UI nesting.
 * @param {boolean} [props.isFirstReply=false] - Penanda apakah ini balasan pertama di dalam grupnya.
 * @param {boolean} [props.isLast=false] - Penanda apakah ini balasan terakhir di dalam grupnya.
 * @param {boolean} [props.canEdit=false] - Penanda izin pengguna untuk mengedit komentar ini.
 * @param {boolean} [props.canDelete=false] - Penanda izin pengguna untuk menghapus komentar ini.
 * @param {Function} [props.onEdit] - Fungsi callback saat komentar diedit.
 * @param {Function} [props.onReply] - Fungsi callback saat komentar dibalas.
 * @param {Function} [props.onDelete] - Fungsi callback saat komentar dihapus.
 * @param {Object} [props.createMutation] - State mutasi untuk pembuatan balasan.
 * @param {Object} [props.updateMutation] - State mutasi untuk pembaruan komentar.
 * @returns {JSX.Element} Tampilan item komentar.
 */
const CommentItem = ({
  item,
  level = 0,
  isFirstReply = false,
  isLast = false,
  canEdit = false,
  canDelete = false,
  onEdit,
  onReply,
  onDelete,
  createMutation = { isPending: false },
  updateMutation = { isPending: false },
}) => {
  const theme = useTheme();
  const radius = theme.shape.borderRadius;

  const isReply = level > 0;

  const [showReplies, setShowReplies] = useState(false);
  const [activeMode, setActiveMode] = useState(null);

  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);
  const [optionsAnchorEl, setOptionsAnchorEl] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { itemContent: "" } });

  const onActionSubmit = useCallback(
    (data) => {
      if (activeMode === "edit") {
        onEdit?.(item.id, data.itemContent, () => setActiveMode(null));
      } else if (activeMode === "reply") {
        onReply?.(item.id, data.itemContent, () => {
          setActiveMode(null);
          setShowReplies(true);
          reset();
        });
      }
    },
    [activeMode, item.id, onEdit, onReply, reset]
  );

  const handleAvatarClick = useCallback(
    (e) => setAvatarAnchorEl(e.currentTarget),
    []
  );
  const closeAvatarPopper = useCallback(() => setAvatarAnchorEl(null), []);

  const handleOptionsClick = useCallback(
    (e) => setOptionsAnchorEl(e.currentTarget),
    []
  );
  const closeOptionsPopper = useCallback(() => setOptionsAnchorEl(null), []);

  const displayName = canEdit || canDelete ? "You" : item.author?.name;
  const hasRepliesAndShown = item.replies?.length > 0 && showReplies;

  const showVerticalLine =
    (level === 0 && hasRepliesAndShown) ||
    (level > 0 && (!isLast || hasRepliesAndShown));

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        mb: isReply ? 3 : 4,
      }}
    >
      <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2.5 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: isReply ? "32px" : "44px",
            position: "relative",
          }}
        >
          {isFirstReply && level === 1 && (
            <Box
              sx={{
                position: "absolute",
                left: "-25px",
                top: "-32px",
                width: "24px",
                height: "52px",
                borderLeft: `2px solid ${theme.palette.divider}`,
                borderBottom: `2px solid ${theme.palette.divider}`,
                borderBottomLeftRadius: radius,
                zIndex: 1,
              }}
            />
          )}

          {showVerticalLine && (
            <Box
              sx={{
                position: "absolute",
                top: isReply ? "20px" : "44px",
                bottom: -24,
                width: "2px",
                backgroundColor: theme.palette.divider,
                zIndex: 1,
              }}
            />
          )}

          <AppProfileAvatar
            size={isReply ? "xs" : "sm"}
            profileUrl={item.author?.avatar}
            displayName={displayName}
            onClick={handleAvatarClick}
            sx={{ zIndex: 2, cursor: "pointer" }}
          />

          <AppPopper
            open={Boolean(avatarAnchorEl)}
            anchorEl={avatarAnchorEl}
            onClose={closeAvatarPopper}
            placement="bottom-start"
            sx={{ p: 2.5, minWidth: 260, borderRadius: radius }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {item.author?.name}
              </Typography>
              {item.author?.bio && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {item.author.bio}
                </Typography>
              )}
            </Box>
          </AppPopper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: radius,
              backgroundColor: alpha(theme.palette.action.hover, 0.03),
              border:
                activeMode === "edit"
                  ? `1px solid ${theme.palette.primary.main}`
                  : `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                }}
                onClick={handleAvatarClick}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • {item.timestamps?.createdAt}
                </Typography>
              </Box>

              {(canEdit || canDelete) && (
                <>
                  <IconButton
                    size="extraSmall"
                    icon={<MoreVertical size={14} />}
                    onClick={handleOptionsClick}
                  />
                  <AppPopper
                    open={Boolean(optionsAnchorEl)}
                    anchorEl={optionsAnchorEl}
                    onClose={closeOptionsPopper}
                    placement="bottom-end"
                    sx={{ p: 1, minWidth: 140, borderRadius: radius }}
                  >
                    <Stack direction="column" spacing={0.5}>
                      {canEdit && (
                        <Box
                          onClick={() => {
                            setActiveMode("edit");
                            closeOptionsPopper();
                          }}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1.5,
                            cursor: "pointer",
                            borderRadius: 1,
                            transition: "background-color 0.2s",
                            "&:hover": { backgroundColor: "action.hover" },
                          }}
                        >
                          <Edit2
                            size={16}
                            color={theme.palette.text.secondary}
                          />
                          <Typography variant="body2" fontWeight={500}>
                            Edit
                          </Typography>
                        </Box>
                      )}

                      {canDelete && (
                        <Box
                          onClick={() => {
                            onDelete?.(item.id);
                            closeOptionsPopper();
                          }}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1.5,
                            cursor: "pointer",
                            borderRadius: 1,
                            color: "error.main",
                            transition: "background-color 0.2s",
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.error.main,
                                0.1
                              ),
                            },
                          }}
                        >
                          <Trash2 size={16} />
                          <Typography variant="body2" fontWeight={500}>
                            Delete
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </AppPopper>
                </>
              )}
            </Box>

            <Typography
              variant="body1"
              sx={{
                mt: 1.5,
                opacity: activeMode === "edit" ? 0.5 : 1,
                lineHeight: 1.6,
              }}
            >
              {item.content}
            </Typography>

            <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "text.secondary",
                  transition: "color 0.2s ease",
                  "&:hover": { color: "primary.main" },
                }}
                onClick={() =>
                  setActiveMode(activeMode === "reply" ? null : "reply")
                }
              >
                Reply
              </Typography>

              {item.replies?.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "text.secondary",
                    transition: "color 0.2s ease",
                    "&:hover": { color: "primary.main" },
                  }}
                  onClick={() => setShowReplies(!showReplies)}
                >
                  {showReplies
                    ? "Hide Replies"
                    : `View ${item.replies.length} Replies`}
                </Typography>
              )}
            </Box>
          </Box>

          <Collapse in={activeMode === "reply" || activeMode === "edit"}>
            <Box sx={{ mt: 2 }}>
              <Controller
                name="itemContent"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <AppInput
                    {...field}
                    minRows={3}
                    error={!!errors.itemContent}
                    placeholder={
                      activeMode === "edit"
                        ? "Edit comment..."
                        : "Write a reply..."
                    }
                    endAdornment={
                      <IconButton
                        size="medium"
                        icon={<SendHorizonal size={16} />}
                        onClick={handleSubmit(onActionSubmit)}
                        isLoading={
                          createMutation.isPending || updateMutation.isPending
                        }
                      />
                    }
                  />
                )}
              />
            </Box>
          </Collapse>
        </Box>
      </Box>

      {hasRepliesAndShown && (
        <Box sx={{ mt: 3, pl: level === 0 ? { xs: "36px", sm: "46px" } : 0 }}>
          {item.replies.map((reply, index) => (
            <CommentItem
              key={reply.id}
              item={reply}
              level={level + 1}
              isFirstReply={index === 0}
              isLast={index === item.replies.length - 1}
              canEdit={reply.canEdit}
              canDelete={reply.canDelete}
              onEdit={onEdit}
              onReply={onReply}
              onDelete={onDelete}
              createMutation={createMutation}
              updateMutation={updateMutation}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

CommentItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    content: PropTypes.string.isRequired,
    timestamps: PropTypes.shape({
      createdAt: PropTypes.string,
    }),
    author: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.string,
      bio: PropTypes.string,
    }),
    replies: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  level: PropTypes.number,
  isFirstReply: PropTypes.bool,
  isLast: PropTypes.bool,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
  onEdit: PropTypes.func,
  onReply: PropTypes.func,
  onDelete: PropTypes.func,
  createMutation: PropTypes.shape({
    isPending: PropTypes.bool,
  }),
  updateMutation: PropTypes.shape({
    isPending: PropTypes.bool,
  }),
};

export default CommentItem;