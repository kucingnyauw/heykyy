import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { AppFlexLayout } from "@heykyy/components";
import { Divider } from "@mui/material";

const errorMessages = {
  404: "Page not found. The page you're looking for doesn’t exist or has been moved.",
  401: "Unauthorized access. You don’t have permission to view this page.",
  503: "Service temporarily unavailable. Please try again later.",
  418: "Something went wrong. Please contact me if the issue persists.",
};

export default function ErrorBoundary() {
  const error = useRouteError();

  let message = "The site is currently under maintenance. Please check back soon.";
  let code = 500;

  if (isRouteErrorResponse(error)) {
    code = error.status;
    message = errorMessages[error.status] || message;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 480, p: 4 }}>
        <Alert severity="error" icon={false}>
          <AppFlexLayout direction="row" align="center" gap={2}>
            {code}
            <Divider  orientation="vertical" flexItem  />
            {message}
          </AppFlexLayout>
        </Alert>
      </Box>
    </Box>
  );
}