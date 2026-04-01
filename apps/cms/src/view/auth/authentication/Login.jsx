import React, { useEffect, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppSnackBar } from "@heykyy/components";
import AuthCardWrapper from "../auth-wrapper/AuthCardWrapper";
import AuthWrapper from "../auth-wrapper/AuthWrapper";
import AuthLogin from "../auth-forms/AuthLogin";
import {
  signInWithOtp,
  loginWithGithub,
  loginWithGoogle,
} from "../../../store/auth/auth-thunk";
import {
  selectAuthError,
  selectAuthMessage,
  selectAuthStatus,
} from "../../../store/auth/auth-selectors";
import { clearMessage, clearError } from "../../../store/auth/auth-slice";

/**
 * Renders the authentication login page.
 * Integrates with Redux to dispatch OTP sign-in requests and handles
 * the display of success or error notifications via a snackbar.
 *
 * @returns {JSX.Element} The login page component.
 */
const Login = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const message = useSelector(selectAuthMessage);
  const error = useSelector(selectAuthError);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    variant: "success",
  });

  useEffect(() => {
    if (message) {
      setSnackbar({ open: true, message: message, variant: "success" });
      dispatch(clearMessage());
    }
    if (error) {
      setSnackbar({ open: true, message: error, variant: "error" });
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  return (
    <AuthWrapper>
      <AuthCardWrapper>
        <AuthLogin
          status={status}
          onGoogleSubmit={() => dispatch(loginWithGoogle())}
          onGithubSubmit={() => dispatch(loginWithGithub())}
          onEmailSubmit={(email) => dispatch(signInWithOtp({ email }))}
        />
      </AuthCardWrapper>

      <AppSnackBar
        open={snackbar.open}
        message={snackbar.message}
        variant={snackbar.variant}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </AuthWrapper>
  );
};

export default memo(Login);
