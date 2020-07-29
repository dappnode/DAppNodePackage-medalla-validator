import React from "react";
import { Typography } from "@material-ui/core";
import { LayoutItem } from "components/LayoutItem";

export function Settings() {
  return (
    <LayoutItem noPaper>
      <Typography variant="h4" color="textSecondary">
        Settings
      </Typography>
    </LayoutItem>
  );
}
