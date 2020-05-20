import React from "react";
import { Typography } from "@material-ui/core";

export const Title: React.FC<{ className?: string }> = ({
  children,
  className,
}) => (
  <Typography
    className={className}
    component="h2"
    variant="h6"
    color="primary"
    gutterBottom
  >
    {children}
  </Typography>
);
