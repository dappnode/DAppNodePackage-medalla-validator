import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, GridSize } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
}));

export const LayoutItem: React.FC<{
  xs?: GridSize;
  sm?: GridSize;
  md?: GridSize;
  lg?: GridSize;
  xl?: GridSize;
  noPaper?: boolean;
}> = function LayoutItem({ noPaper, children, ...props }) {
  const classes = useStyles();
  if (noPaper)
    return (
      <Grid item xs={12} {...props}>
        {children}
      </Grid>
    );
  else
    return (
      <Grid item xs={12} {...props}>
        <Paper className={classes.paper}>{children}</Paper>
      </Grid>
    );
};
