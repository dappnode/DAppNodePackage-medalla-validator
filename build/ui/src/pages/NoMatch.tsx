import React from "react";
import { useLocation } from "react-router";
import { Typography } from "@material-ui/core";
import { LayoutItem } from "components/LayoutItem";
import { TitlePage } from "components/Title";

export function NoMatch() {
  let location = useLocation();

  return (
    <TitlePage>
      No match for <code>{location.pathname}</code>
    </TitlePage>
  );
}
