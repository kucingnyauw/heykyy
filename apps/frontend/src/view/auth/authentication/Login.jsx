import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppSnackBar } from "@heykyy/components";
import {
  signInWithOtp,
  loginWithGithub,
  loginWithGoogle,
} from "../../../store/auth/auth-thunk";
import {
  selectAuthStatus,
  selectAuthMessage,
  selectAuthError,
} from "../../../store/auth/auth-selectors";
import { clearError, clearMessage } from "../../../store/auth/auth-slice";
import AuthCardWrapper from "../auth-wrapper/AuthCardWrapper";
import AuthWrapperAnimated from "../auth-wrapper/AuthWrapper";
import AuthLogin from "../auth-forms/AuthLogin";

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
    <>
      <AuthWrapperAnimated>
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
      </AuthWrapperAnimated>
    </>
  );
};

export default Login;
