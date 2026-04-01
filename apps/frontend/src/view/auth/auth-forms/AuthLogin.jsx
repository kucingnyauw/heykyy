import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import {
  AppLoading,
  AppInput,
  FilledButton,
  OutlinedButton,
  AppFlexLayout,
} from "@heykyy/components";

const Logo = ({ src, alt }) => (
  <img width={20} height={20} src={src} alt={alt} />
);

const AuthLogin = ({
  onGoogleSubmit,
  onGithubSubmit,
  onEmailSubmit,
  status = "idle",
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const isLoading = status === "loading";

  const submit = (data) => {
    onEmailSubmit?.(data.email);
    reset({ email: "" });
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)} style={{ width: "100%" }}>
        <AppFlexLayout
          direction="column"
          gap={3}
          alignItems="stretch"
          sx={{ width: "100%" }}
        >
          {/* Header */}
          <AppFlexLayout
            direction="column"
            gap={1}
            alignItems="center"
            sx={{ width: "100%", textAlign: "center" }}
          >
            <Typography variant="h5" fontWeight={600}>
              Join the Experience
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 320 }}
            >
              Enter your email or continue with Google or GitHub to connect and
              explore my work.
            </Typography>
          </AppFlexLayout>

          {/* Email */}
          <Box sx={{ width: "100%" }}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                  message: "Invalid email format",
                },
              }}
              render={({ field }) => (
                <AppInput
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  disabled={isLoading}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  endAdornment={<></>}
                />
              )}
            />
          </Box>

          {/* Submit */}
          <FilledButton
            size="small"
            type="submit"
            fullWidth
            disabled={!isValid || isLoading}
            sx={{ height: 48 }}
          >
            Submit
          </FilledButton>

          {/* Divider */}
          <AppFlexLayout alignItems="center" gap={2} sx={{ width: "100%" }}>
            <Box
              sx={{
                flex: 1,
                borderTop: "1px dashed",
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(0,0,0,0.18)",
                opacity: 0.8,
              }}
            />

            <Typography variant="caption" color="text.secondary">
              OR
            </Typography>

            <Box
              sx={{
                flex: 1,
                borderTop: "1px dashed",
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(0,0,0,0.18)",
                opacity: 0.8,
              }}
            />
          </AppFlexLayout>

          {/* Social */}
          <AppFlexLayout gap={2} sx={{ width: "100%" }}>
            <OutlinedButton
            size="medium"
              fullWidth
              startIcon={
                <Logo
                  src="https://img.icons8.com/fluency/48/google-logo.png"
                  alt="google"
                />
              }
              onClick={onGoogleSubmit}
              disabled={isLoading}
              sx={{ height: 48, flex: 1 }}
            >
              Google
            </OutlinedButton>

            <OutlinedButton
            size="medium"
              fullWidth
              startIcon={
                <Logo
                  src="https://img.icons8.com/material-outlined/48/github.png"
                  alt="github"
                />
              }
              onClick={onGithubSubmit}
              disabled={isLoading}
              sx={{ height: 48, flex: 1 }}
            >
              GitHub
            </OutlinedButton>
          </AppFlexLayout>
        </AppFlexLayout>
      </form>
      {isLoading && <AppLoading />}
    </>
  );
};

AuthLogin.propTypes = {
  onGoogleSubmit: PropTypes.func,
  onGithubSubmit: PropTypes.func,
  onEmailSubmit: PropTypes.func,
  status: PropTypes.oneOf(["idle", "loading", "success", "error"]),
};

export default AuthLogin;
