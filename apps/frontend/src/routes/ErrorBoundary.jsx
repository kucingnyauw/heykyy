import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AppFlexLayout } from "@heykyy/components";
import { Divider } from "@mui/material";

const errorMessages = {
  400: "Bad request. Something is not right.",
  401: "Unauthorized. Please login first.",
  403: "Forbidden. You don’t have access.",
  404: "Page not found.",
  409: "Conflict detected. Data may already exist.",
  422: "Validation failed. Please check your input.",
  429: "Too many requests. Slow down a bit.",
  500: "Internal server error.",
  502: "Bad gateway.",
  503: "Service unavailable.",
  418: "Something weird happened 🫠",
};

export default function ErrorBoundary() {
  const error = useRouteError();

  let code = 500;
  let message = errorMessages[500];
  let detail = "";

  if (isRouteErrorResponse(error)) {
    code = error.status;
    message = errorMessages[code] || message;

    try {
      const parsed = JSON.parse(error.data);
      detail = parsed?.message;
    } catch {
      detail = error.statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
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
      <Box sx={{ width: "100%", maxWidth: 520 }}>
        <Alert severity="error" icon={false}>
          <AppFlexLayout direction="column" gap={2}>
            <AppFlexLayout direction="row" align="center" gap={2}>
              <Typography fontWeight={700}>{code}</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography fontWeight={500}>{message}</Typography>
            </AppFlexLayout>

            {detail && (
              <Typography variant="caption" color="text.secondary">
                {detail}
              </Typography>
            )}
          </AppFlexLayout>
        </Alert>
      </Box>
    </Box>
  );
}