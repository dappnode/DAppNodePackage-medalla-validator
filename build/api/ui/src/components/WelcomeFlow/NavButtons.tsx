import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

export function NavButtons({
  onBack,
  onNext,
  disableNext,
  nextLabel = "Next",
}: {
  onBack?: () => void;
  onNext?: () => void;
  disableNext?: boolean;
  nextLabel?: string;
}) {
  const classes = useStyles();

  return (
    <div className={classes.buttons}>
      {onBack && (
        <Button onClick={onBack} className={classes.button}>
          Back
        </Button>
      )}
      {onNext && (
        <Button
          variant="contained"
          color="primary"
          onClick={onNext}
          className={classes.button}
          disabled={disableNext}
        >
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
