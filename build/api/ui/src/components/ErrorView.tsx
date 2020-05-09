import React from "react";
// Material UI
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
}));

function parseError(error: Error | string) {
  if (error instanceof Error)
    return { message: error.message, detail: error.stack };
  if (typeof error === "string") return { message: error };
  return { message: JSON.stringify(error), detail: "" };
}

export function ErrorView({ error }: { error: Error | string }) {
  const classes = useStyles();
  const { message, detail } = parseError(error);

  return (
    <React.Fragment>
      <Typography color="secondary">
        <details>
          <summary>{message.split("\n")[0]}</summary>
          <pre className={classes.pre}>{detail}</pre>
        </details>
      </Typography>
    </React.Fragment>
  );
}
