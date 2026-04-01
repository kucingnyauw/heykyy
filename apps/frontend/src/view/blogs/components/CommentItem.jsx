import React, { useState, useCallback, memo } from "react";
import { Box, Typography, Chip, Collapse, useTheme, alpha } from "@mui/material";
import { MoreVertical, SendHorizonal } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { DateUtils } from "@heykyy/utils-frontend";
import {
  AppFlexLayout,
  AppProfileAvatar,
  AppPopper,
  IconButton,
  
  AppInput,
} from "@heykyy/components";
import { ROLE } from "@heykyy/constant";

const CommentItem = memo(
  ({
    item,
    isReply = false,
    isFirstReply = false,
    isLast = false,
    onEdit,
    onDelete,
    onReply,
    createMutation,
    updateMutation,
  }) => {
    const theme = useTheme();
    const radius = theme.shape.borderRadius;
    const [showReplies, setShowReplies] = useState(false);
    const [activeMode, setActiveMode] = useState(null);
    const [commentAnchorEl, setCommentAnchorEl] = useState(null);
    const [actionAnchorEl, setActionAnchorEl] = useState(null);

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm({
      defaultValues: { itemContent: "" },
    });

    const onActionSubmit = useCallback(
      (data) => {
        if (activeMode === "edit") {
          onEdit(item.id, data.itemContent, () => setActiveMode(null));
        } else if (activeMode === "reply") {
          onReply(item.id, data.itemContent, () => {
            setActiveMode(null);
            setShowReplies(true);
            reset();
          });
        }
      },
      [activeMode, item.id, onEdit, onReply, reset]
    );

    const handleAvatarClick = useCallback((e) => setCommentAnchorEl(e.currentTarget), []);
    const handleActionClick = useCallback((e) => setActionAnchorEl(e.currentTarget), []);
    const closePoppers = useCallback(() => {
      setCommentAnchorEl(null);
      setActionAnchorEl(null);
    }, []);

    return (
      <Box sx={{ width: "100%", position: "relative", mb: isReply ? 2 : 3 }}>
        <Box sx={{ display: "flex", gap: 2, position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              minWidth: isReply ? "32px" : "44px",
            }}
          >
            {isFirstReply && (
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
                  zIndex: 1 
                }} 
              />
            )}
            {((isReply && !isLast) || (!isReply && item.replies?.length > 0 && showReplies)) && (
              <Box 
                sx={{ 
                  position: "absolute", 
                  top: isReply ? "20px" : "44px", 
                  bottom: -16, 
                  width: "2px", 
                  backgroundColor: theme.palette.divider, 
                  zIndex: 1 
                }} 
              />
            )}
            <AppProfileAvatar
              size="sm"
              profileUrl={item.author?.avatar}
              displayName={item.author?.name}
              onClick={handleAvatarClick}
              sx={{ zIndex: 2, cursor: "pointer" }}
            />
            <AppPopper
              open={Boolean(commentAnchorEl)}
              anchorEl={commentAnchorEl}
              onClose={closePoppers}
              placement="bottom-start"
              sx={{ p: 2.5, minWidth: 260, borderRadius: radius }}
            >
              <AppFlexLayout direction="column" align="flex-start" gap={1.5}>
                <AppFlexLayout direction="row" align="center" gap={1.5}>
                  <AppProfileAvatar
                    size="sm"
                    profileUrl={item.author?.avatar}
                    displayName={item.author?.name}
                  />
                  <AppFlexLayout direction="row" align="center" gap={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.author?.name}
                    </Typography>
                    {item.author?.role && (
                      <Chip
                        label={
                          item.author?.role
                            ? ROLE[item.author.role.toUpperCase()]
                            : ROLE.USER
                        }
                        size="small"
                        sx={{ height: 20, fontSize: "0.65rem", borderRadius: radius }}
                      />
                    )}
                  </AppFlexLayout>
                </AppFlexLayout>
                {item.author?.bio && (
                  <Typography variant="body2" color="text.secondary">
                    {item.author.bio}
                  </Typography>
                )}
              </AppFlexLayout>
            </AppPopper>
          </Box>

          <Box sx={{ flex: 1, pb: (item.replies?.length > 0 && showReplies) ? 2 : 0 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: radius,
                backgroundColor: alpha(theme.palette.action.hover, 0.03),
                border: activeMode === "edit" 
                  ? `1px solid ${theme.palette.primary.main}` 
                  : `1px solid ${theme.palette.divider}`,
              }}
            >
              <AppFlexLayout justify="space-between" align="center" direction="row">
                <AppFlexLayout 
                  align="center" 
                  gap={0.5} 
                  direction="row" 
                  onClick={handleAvatarClick} 
                  sx={{ cursor: "pointer" }}
                >
                  <Typography 
                    variant="subtitle2" 
                    fontWeight={600} 
                    sx={{ "&:hover": { color: "primary.main" } }}
                  >
                    {item.author?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • {DateUtils.formatTimeAgo(item.timestamps?.createdAt)}
                  </Typography>
                </AppFlexLayout>

                {item.permissions?.canEdit && (
                  <>
                    <IconButton size="extraSmall" icon={<MoreVertical size={14} />} onClick={handleActionClick} />
                    <AppPopper
              open={Boolean(commentAnchorEl)}
              anchorEl={commentAnchorEl}
              onClose={closePoppers}
              placement="bottom-start"
              sx={{ p: 2.5, minWidth: 260, borderRadius: radius }}
            >
              <AppFlexLayout direction="column" align="flex-start" gap={1.5}>
                <AppFlexLayout direction="row" align="center" gap={1.5}>
                  <AppProfileAvatar
                    size="sm"
                    profileUrl={item.author?.avatar}
                    displayName={item.author?.name}
                  />
                  <AppFlexLayout direction="row" align="center" gap={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.author?.name}
                    </Typography>
                    {item.author?.role && (
                      <Chip
                        label={
                          item.author?.role
                            ? ROLE[item.author.role.toUpperCase()]
                            : ROLE.USER
                        }
                        size="small"
                        sx={{ height: 20, fontSize: "0.65rem", borderRadius: radius }}
                      />
                    )}
                  </AppFlexLayout>
                </AppFlexLayout>
                {item.author?.bio && (
                  <Typography variant="body2" color="text.secondary">
                    {item.author.bio}
                  </Typography>
                )}
              </AppFlexLayout>
            </AppPopper>
                  </>
                )}
              </AppFlexLayout>
              <Typography variant="body1" sx={{ mt: 0.5, opacity: activeMode === "edit" ? 0.5 : 1 }}>
                {item.content}
              </Typography>
              <AppFlexLayout sx={{ mt: 1 }} gap={2} direction="row" align="center">
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600, 
                    cursor: "pointer", 
                    color: "text.secondary", 
                    "&:hover": { color: "primary.main" } 
                  }} 
                  onClick={() => setActiveMode(activeMode === "reply" ? null : "reply")}
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
                      "&:hover": { color: "primary.main" } 
                    }} 
                    onClick={() => setShowReplies(!showReplies)}
                  >
                    {showReplies ? "Hide Replies" : `View ${item.replies.length} Replies`}
                  </Typography>
                )}
              </AppFlexLayout>
            </Box>
            <Collapse in={activeMode === "reply" || activeMode === "edit"}>
              <Box sx={{ mt: 1.5 }}>
                <Controller
                  name="itemContent"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <AppInput
                      {...field}
                      minRows={3}
                      error={!!errors.itemContent}
                      placeholder={activeMode === "edit" ? "Edit comment..." : "Write a reply..."}
                      endAdornment={
                        <IconButton 
                        size="medium"
                          onClick={handleSubmit(onActionSubmit)} 
                          icon={<SendHorizonal size={16} />} 
                          isLoading={createMutation.isPending || updateMutation.isPending} 
                        />
                      }
                    />
                  )}
                />
              </Box>
            </Collapse>
          </Box>
        </Box>
        {item.replies?.length > 0 && showReplies && (
          <Box sx={{ pl: isReply ? "32px" : "46px" }}>
            {item.replies.map((reply, index) => (
              <CommentItem
                key={reply.id}
                item={reply}
                isReply={true}
                isFirstReply={index === 0}
                isLast={index === item.replies.length - 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
                createMutation={createMutation}
                updateMutation={updateMutation}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  }
);

export default CommentItem;