import React from "react";
import PropTypes from "prop-types";
import { Card } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  width: "100%",
  maxWidth: 480,
  margin: "0 auto",
  borderRadius: 16,
  padding: theme.spacing(6),
  boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 50px",
  display: "flex",
  flexDirection: "column",

  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(5),
    maxWidth: 440,
  },

  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4),
    maxWidth: "calc(100vw - 48px)",
    borderRadius: 12,
  },

  [theme.breakpoints.down("xs")]: {
    padding: theme.spacing(3),
    maxWidth: "calc(100vw - 32px)",
    borderRadius: 10,
 
  },
}));

export default function AuthCardWrapper({ children, onUserInput, ...other }) {
  return (
    <StyledCard {...other}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { onUserInput })
          : child
      )}
    </StyledCard>
  );
}

AuthCardWrapper.propTypes = {
  children: PropTypes.node,
  onUserInput: PropTypes.func,
};
