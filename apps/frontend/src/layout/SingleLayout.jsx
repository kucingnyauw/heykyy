import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import SingleContentStyled from "./SingleContentStyled";
import ReadingHeader from "./Header/ReadingHeader";
import Footer from "./Footer/Footer";

/**
 * A layout component tailored for single-focus content, such as articles or standalone pages.
 * It pairs a specialized reading header with a constrained-width content area to
 * optimize readability and user focus, followed by a standard footer.
 *
 * @param {Object} props - The component properties.
 * @param {React.ReactNode} [props.children] - Optional child components to render directly. Falls back to <Outlet /> for nested routing.
 * @returns {JSX.Element} The minimalist layout structure.
 */
const SingleLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <ReadingHeader />
      <SingleContentStyled>
        {children || <Outlet />}
      </SingleContentStyled>
      <Footer />
    </Box>
  );
};

export default SingleLayout;