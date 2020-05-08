import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import { StepSelectWithdrawl } from "./StepSelectWithdrawl";
import { StepDeposit } from "./StepDeposit";
import { FooterNote } from "../FooterNote";
import { NavButtons } from "./NavButtons";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  layout: {
    width: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: 600,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

export function WelcomeFlow({ onExit }: { onExit: () => void }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [withdrawlAccount, setWithdrawlAccount] = useState("");

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const steps = ["Withdrawl", "Deposit"];
  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return (
          <StepSelectWithdrawl
            withdrawlAccount={withdrawlAccount}
            setWithdrawlAccount={setWithdrawlAccount}
            onNext={handleNext}
            onBack={onExit}
          />
        );
      case 1:
        return (
          <StepDeposit
            withdrawlAccount={withdrawlAccount}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <React.Fragment>
            <Typography variant="h5" gutterBottom>
              Validator deposit done!
            </Typography>
            <Typography variant="subtitle1">
              Now the validator is waiting for its activation. This process
              takes about 2 hours. You can track in the main panel when you get
              assigned.
            </Typography>
            <NavButtons onNext={onExit}></NavButtons>
          </React.Fragment>
        );
      default:
        return (
          <Typography color="textSecondary" align="center">
            Unknown step
          </Typography>
        );
    }
  }

  return (
    <main className={classes.layout}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h4" align="center">
          Create validator
        </Typography>
        <Stepper activeStep={activeStep} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
      </Paper>
      <FooterNote />
    </main>
  );
}
