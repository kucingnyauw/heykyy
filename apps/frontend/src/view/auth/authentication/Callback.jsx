import React, { useEffect, useState, useRef, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Typography, CircularProgress, Box } from "@mui/material";
import { AppFlexLayout, FilledButton } from "@heykyy/components";
import { supabase } from "../../../lib/supabase";
import AuthWrapper from "../auth-wrapper/AuthWrapper";

/**
 * Renders the loading state UI during the authentication verification process.
 *
 * @returns {JSX.Element} The loading state component.
 */
const LoadingState = memo(() => (
  <>
    <CircularProgress size={48} thickness={4} />
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Authenticating
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 320, mx: "auto", lineHeight: 1.6 }}
      >
        Verifying your secure sign-in link. Please wait while we complete the
        process.
      </Typography>
    </Box>
  </>
));

/**
 * Renders the success state UI after a valid authentication session is established.
 *
 * @returns {JSX.Element} The success state component.
 */
const SuccessState = memo(() => (
  <Box>
    <Typography
      variant="h6"
      fontWeight={700}
      color="success.main"
      sx={{ mb: 1 }}
    >
      Sign In Successful
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ maxWidth: 320, mx: "auto", lineHeight: 1.6 }}
    >
      Your session has been verified. Redirecting you to the dashboard...
    </Typography>
  </Box>
));

/**
 * Renders the error state UI when the authentication verification fails.
 *
 * @param {Object} props - The component props.
 * @param {string} props.message - The detailed error message to display to the user.
 * @param {Function} props.onBack - The callback function triggered by the back button.
 * @returns {JSX.Element} The error state component.
 */
const ErrorState = memo(({ message, onBack }) => (
  <Box>
    <Typography variant="h6" fontWeight={700} color="error.main" sx={{ mb: 1 }}>
      Verification Failed
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ maxWidth: 360, mx: "auto", lineHeight: 1.6, mb: 3 }}
    >
      {message}
    </Typography>
    <FilledButton size="small" onClick={onBack}>Back to Login</FilledButton>
  </Box>
));

/**
 * Handles the authentication callback by exchanging the verification code for a session.
 * It also monitors for error parameters in the URL hash and ensures the authentication
 * process is only executed once via a reference guard.
 *
 * @returns {JSX.Element} The authentication callback UI.
 */
const CallbackAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleAuthentication = async () => {
      try {
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const errorMsg =
          hashParams.get("error_description") || hashParams.get("error");

        if (errorMsg) {
          throw new Error(errorMsg.replace(/\+/g, " "));
        }

        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");

        if (!code) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            setStatus("success");
            setTimeout(() => navigate("/", { replace: true }), 1500);
            return;
          }
          throw new Error("No valid authentication code or session detected.");
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.exchangeCodeForSession(code);

        if (error) throw error;

        if (session) {
          setStatus("success");
          setTimeout(() => navigate("/", { replace: true }), 1500);
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err.message || "An unexpected error occurred during sign-in."
        );
      }
    };

    handleAuthentication();
  }, [location, navigate]);

  return (
    <AuthWrapper>
      <AppFlexLayout
        direction="column"
        align="center"
        justify="center"
        gap={3}
        sx={{ textAlign: "center", width: "100%", py: 6 }}
      >
        {status === "loading" && <LoadingState />}
        {status === "success" && <SuccessState />}
        {status === "error" && (
          <ErrorState
            message={errorMessage}
            onBack={() => navigate("/login", { replace: true })}
          />
        )}
      </AppFlexLayout>
    </AuthWrapper>
  );
};

export default memo(CallbackAuth);
