import React from "react";
import Typography from "@material-ui/core/Typography";

export const Title: React.FC = ({ children }) => (
  <Typography component="h2" variant="h6" color="primary" gutterBottom>
    {children}
  </Typography>
);
