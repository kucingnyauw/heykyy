import React, { useEffect, useState, memo, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  useTheme,
  Avatar,
  useMediaQuery,
  alpha,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  Shield,
  Activity,
  LayoutTemplate,
  Mail,
  User,
  Info,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";

import {
  AppFlexLayout,
  AppGridLayout,
  AppInput,
  FilledButton,
  OutlinedButton,
  AppSnackBar,
  AppLoading,
} from "@heykyy/components";

import { setUser } from "../../store/auth/auth-slice";
import { selectAuthUser } from "../../store/auth/auth-selectors";
import { updateUser, activity } from "../../services/user-services";
import { DateUtils } from "@heykyy/utils-frontend";
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";
import { ROLE } from "@heykyy/constant";

const Profile = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const fileInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    variant: "success",
  });

  const user = useSelector(selectAuthUser);

  const { data: userActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["user-activity"],
    queryFn: () => activity(),
    staleTime: 30 * 60 * 1000,
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: { name: "", about: "", file: null },
    mode: "onChange",
  });

  const watchedAbout = watch("about");
  const { markAsSaved } = useUnsavedChangesGuard(isDirty);

  const updateMutation = useMutation({
    mutationFn: (data) => updateUser(data),
    onSuccess: (res) => {
      markAsSaved();
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      dispatch(setUser(res?.data));
      setSnackbar({
        open: true,
        message: res?.message || "Profile updated successfully!",
        variant: "success",
      });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: err || "Failed to update profile",
        variant: "error",
      });
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user?.name || "",
        about: user?.about || "",
        file: null,
      });
      setAvatarPreview(user?.avatar);
    }
  }, [user, reset]);

  const handleImageChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
          setSnackbar({
            open: true,
            message: "Invalid image format. Use JPG, PNG, or WEBP.",
            variant: "error",
          });
          return;
        }
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
        setValue("file", file, { shouldDirty: true });
      }
    },
    [setValue]
  );

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    reset({
      name: user?.name || "",
      about: user?.about || "",
      file: null,
    });
    setAvatarPreview(user?.avatar);
  };

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "error";
      case "USER":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <>
      {updateMutation.isPending && <AppLoading />}
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <AppFlexLayout  direction="column" gap={3} sx={{ width: "100%" , px : {sm : 8, md : 10} }}>
          <AppFlexLayout
            sx={{ width: "100%" }}
            direction="column"
            align="center"
            gap={2}
          >
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: `3px solid ${theme.palette.primary.main}`,
                padding: "4px",
                cursor: "pointer",
                position: "relative",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              <Avatar
                src={avatarPreview}
                sx={{ width: "100%", height: "100%" }}
              />
              <Box
                component="label"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: -4,
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.text.primary,
                  color: theme.palette.background.paper,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: `3px solid ${theme.palette.background.paper}`,
                  transition: "0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    bgcolor: theme.palette.text.secondary,
                  },
                }}
              >
                <UploadCloud size={16} strokeWidth={2} />
              </Box>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </AppFlexLayout>

          <Card
            sx={{
              width: "100%",
              borderRadius: theme.shape.borderRadius,
              overflow: "hidden",
              boxShadow: theme.shadows[4],
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <AppFlexLayout
                sx={{ width: "100%" }}
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={2}
              >
                <AppFlexLayout gap={2} align="center">
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: "flex",
                    }}
                  >
                    <LayoutTemplate
                      size={20}
                      color={theme.palette.primary.main}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Account Overview
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Summary of your account status
                    </Typography>
                  </Box>
                </AppFlexLayout>
              </AppFlexLayout>
            </Box>

            <Box sx={{ width: "100%", p: 3 }}>
              <AppGridLayout
                sx={{ width: "100%" }}
                columns={{ xs: "1fr", sm: "repeat(3, 1fr)" }}
                gap={2}
              >
                {[
                  {
                    label: "Account Status",
                    icon: (
                      <CheckCircle2
                        size={16}
                        color={theme.palette.success.main}
                      />
                    ),
                    value: (
                      <Chip
                        label={
                          user?.role ? ROLE[user.role.toUpperCase()] : ROLE.USER
                        }
                        size="small"
                        color={getRoleColor(user?.role)}
                        sx={{ fontWeight: 600, height: 20, fontSize: "0.7rem" }}
                      />
                    ),
                  },
                  {
                    label: "Member Since",
                    icon: <Calendar size={16} />,
                    value: (
                      <Typography variant="body2" fontWeight={500}>
                        {user?.createdAt
                          ? DateUtils.formatDateTime(user.createdAt).split(
                              ","
                            )[0]
                          : "-"}
                      </Typography>
                    ),
                  },
                  {
                    label: "Last Updated",
                    icon: <Clock size={16} />,
                    value: (
                      <Typography variant="body2" fontWeight={500}>
                        {user?.updatedAt
                          ? DateUtils.formatDateTime(user.updatedAt).split(
                              ","
                            )[0]
                          : "-"}
                      </Typography>
                    ),
                  },
                ].map((item, index) => (
                  <Card
                    key={index}
                    variant="outlined"
                    sx={{
                      width: "100%",
                      p: 2,
                      borderRadius: theme.shape.borderRadius,
                      bgcolor: alpha(theme.palette.background.default, 0.4),
                      boxShadow: "none",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                      display="block"
                      sx={{ textTransform: "uppercase", fontWeight: 600 }}
                    >
                      {item.label}
                    </Typography>
                    <AppFlexLayout
                      sx={{ width: "100%" }}
                      gap={1}
                      align="center"
                    >
                      {item.icon}
                      {item.value}
                    </AppFlexLayout>
                  </Card>
                ))}
              </AppGridLayout>
            </Box>
          </Card>

          <Card
            sx={{
              width: "100%",
              borderRadius: theme.shape.borderRadius,
              overflow: "hidden",
              boxShadow: theme.shadows[4],
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <AppFlexLayout
                sx={{ width: "100%" }}
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={2}
              >
                <AppFlexLayout gap={2} align="center">
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: "flex",
                    }}
                  >
                    <User size={20} color={theme.palette.primary.main} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Personal Information
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Manage your profile details
                    </Typography>
                  </Box>
                </AppFlexLayout>
                {isDirty && (
                  <Chip
                    label="Unsaved Changes"
                    size="small"
                    color="warning"
                    icon={<AlertCircle size={14} />}
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </AppFlexLayout>
            </Box>

            <AppFlexLayout
              sx={{ width: "100%", p: 3 }}
              direction="column"
              gap={3}
            >
              <Card
                variant="outlined"
                sx={{
                  width: "100%",
                  p: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.8),
                  borderRadius: theme.shape.borderRadius,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "none",
                }}
              >
                <AppFlexLayout
                  sx={{ width: "100%" }}
                  justify="space-between"
                  align="center"
                >
                  <AppFlexLayout gap={2} align="center">
                    <Mail size={18} color={theme.palette.text.secondary} />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: "uppercase", fontWeight: 600 }}
                      >
                        Email Address
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {user?.email}
                      </Typography>
                    </Box>
                  </AppFlexLayout>
                  <Chip
                    label="Verified"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </AppFlexLayout>
              </Card>

              <Box sx={{ width: "100%" }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <AppInput
                      {...field}
                      label="Full Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      startAdornment={<User size={18} />}
                      fullWidth
                    />
                  )}
                />
              </Box>

              <Box sx={{ width: "100%" }}>
                <Controller
                  name="about"
                  control={control}
                  rules={{ maxLength: 500 }}
                  render={({ field }) => (
                    <AppInput
                      {...field}
                      label="About"
                      multiline
                      minRows={4}
                      helperText={`${watchedAbout?.length || 0}/500`}
                      startAdornment={<Info size={18} />}
                      fullWidth
                    />
                  )}
                />
              </Box>
            </AppFlexLayout>
          </Card>

          <Card
            sx={{
              width: "100%",
              borderRadius: theme.shape.borderRadius,
              overflow: "hidden",
              boxShadow: theme.shadows[4],
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <AppFlexLayout
                sx={{ width: "100%" }}
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={2}
              >
                <AppFlexLayout gap={2} align="center">
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: "flex",
                    }}
                  >
                    <Activity size={20} color={theme.palette.primary.main} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Recent Activity
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your latest actions and events
                    </Typography>
                  </Box>
                </AppFlexLayout>
              </AppFlexLayout>
            </Box>

            <Box sx={{ width: "100%", p: 3 }}>
              {activityLoading ? (
                <AppFlexLayout
                  sx={{ width: "100%" }}
                  direction="column"
                  gap={1.5}
                >
                  {[1, 2, 3].map((key) => (
                    <Card
                      key={key}
                      variant="outlined"
                      sx={{
                        width: "100%",
                        p: 2,
                        borderRadius: theme.shape.borderRadius,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        boxShadow: "none",
                      }}
                    >
                      <Skeleton
                        variant="rounded"
                        width={36}
                        height={36}
                        sx={{ borderRadius: "8px" }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="30%" height={16} />
                      </Box>
                    </Card>
                  ))}
                </AppFlexLayout>
              ) : userActivity && userActivity.length > 0 ? (
                <AppFlexLayout
                  sx={{ width: "100%" }}
                  direction="column"
                  gap={1.5}
                >
                  {userActivity.map((item, i) => (
                    <Card
                      key={i}
                      variant="outlined"
                      sx={{
                        width: "100%",
                        p: 2,
                        borderRadius: theme.shape.borderRadius,
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5,
                        "&:hover": {
                          borderColor: theme.palette.text.secondary,
                        },
                        transition: "border-color 0.2s ease-in-out",
                        boxShadow: "none",
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          color: theme.palette.primary.main,
                          borderRadius: "8px",
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.1
                          )}`,
                        }}
                      >
                        <Typography variant="body2" fontWeight={700}>
                          {i + 1}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ mb: 0.5 }}
                          noWrap
                        >
                          {item.sentence}
                        </Typography>
                        <AppFlexLayout
                          sx={{ width: "100%" }}
                          gap={1}
                          align="center"
                        >
                          <Clock
                            size={12}
                            color={theme.palette.text.secondary}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {DateUtils.formatDateTime(item.timestamp)}
                          </Typography>
                        </AppFlexLayout>
                      </Box>
                    </Card>
                  ))}
                </AppFlexLayout>
              ) : (
                <AppFlexLayout
                  direction="column"
                  align="center"
                  justify="center"
                  sx={{ py: 6, opacity: 0.5, width: "100%" }}
                >
                  <AlertCircle size={36} strokeWidth={1.5} />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    No recent activity found.
                  </Typography>
                </AppFlexLayout>
              )}
            </Box>
          </Card>

          <Card
            sx={{
              width: "100%",
              borderRadius: theme.shape.borderRadius,
              overflow: "hidden",
              boxShadow: theme.shadows[4],
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <AppFlexLayout
                sx={{ width: "100%" }}
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={2}
              >
                <AppFlexLayout gap={2} align="center">
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: "flex",
                    }}
                  >
                    <Shield size={20} color={theme.palette.primary.main} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Account Security
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Review your security and login history
                    </Typography>
                  </Box>
                </AppFlexLayout>
              </AppFlexLayout>
            </Box>

            <Box sx={{ width: "100%", p: 3 }}>
              <AppGridLayout
                columns={{ xs: "1fr", sm: "1fr 1fr" }}
                gap={3}
                sx={{ width: "100%" }}
              >
                {[
                  {
                    label: "Account Created",
                    icon: (
                      <Calendar
                        size={18}
                        color={theme.palette.text.secondary}
                      />
                    ),
                    value: user?.createdAt
                      ? DateUtils.formatDateTime(user.createdAt)
                      : "-",
                  },
                  {
                    label: "Last Login Session",
                    icon: (
                      <RefreshCw
                        size={18}
                        color={theme.palette.text.secondary}
                      />
                    ),
                    value: user?.updatedAt
                      ? DateUtils.formatDateTime(user.updatedAt)
                      : "-",
                  },
                ].map((sec, i) => (
                  <AppFlexLayout
                    key={i}
                    sx={{ width: "100%" }}
                    gap={2}
                    align="center"
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {sec.icon}
                    </Box>
                    <Box sx={{ width: "100%" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {sec.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sec.value}
                      </Typography>
                    </Box>
                  </AppFlexLayout>
                ))}
              </AppGridLayout>
            </Box>
          </Card>

          <Card
            variant="outlined"
            sx={{
              width: "100%",
              p: 2,
              borderRadius: theme.shape.borderRadius,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(8px)",
              border: `1px solid ${theme.palette.divider}`,
              position: "sticky",
              bottom: 16,
              zIndex: 10,
              boxShadow: theme.shadows[3],
            }}
          >
            <AppFlexLayout
              sx={{ width: "100%" }}
              direction={isMobile ? "column" : "row-reverse"}
              gap={2}
            >
              <Box sx={{ width: isMobile ? "100%" : "auto" }}>
                <FilledButton
                size="medium"
                  type="submit"
                  disabled={!isDirty || updateMutation.isPending}
                  fullWidth={isMobile}
                  sx={{ minWidth: isMobile ? "100%" : 200 }}
                >
                  Save Changes
                </FilledButton>
              </Box>
              {isDirty && (
                <Box sx={{ width: isMobile ? "100%" : "auto" }}>
                  <OutlinedButton
                  size="medium"
                    fullWidth={isMobile}
                    onClick={handleCancel}
                    startIcon={<X size={18} />}
                    sx={{ minWidth: isMobile ? "100%" : 120 }}
                  >
                    Cancel
                  </OutlinedButton>
                </Box>
              )}
            </AppFlexLayout>
          </Card>
        </AppFlexLayout>
      </form>

      <AppSnackBar
        variant={snackbar.variant}
        open={snackbar.open}
        message={snackbar.message}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default memo(Profile);
