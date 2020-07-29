import React from "react";
import { useLocation } from "react-router";
import { Typography } from "@material-ui/core";
import { LayoutItem } from "components/LayoutItem";

export function NoMatch() {
  let location = useLocation();

  return (
    <LayoutItem noPaper>
      <Typography variant="h5" color="textSecondary" align="center">
        No match for <code>{location.pathname}</code>
      </Typography>
    </LayoutItem>
  );
}
