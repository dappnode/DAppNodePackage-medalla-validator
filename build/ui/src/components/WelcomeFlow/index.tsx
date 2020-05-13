import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Link,
} from "@material-ui/core";
import { StepSelectValidator } from "./StepSelectValidator";
import { StepSelectWithdrawal } from "./StepSelectWithdrawal";
import { StepDeposit } from "./StepDeposit";
import { FooterNote } from "../FooterNote";
import { NavButtons } from "./NavButtons";
import { goerliTxViewer } from "common/params";
import { urlJoin } from "utils";

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
  const [validatorAccount, setValidatorAccount] = useState(""); // validator/1
  const [withdrawalAccount, setWithdrawalAccount] = useState(""); // withdrawal/primary
  const [depositTxHash, setDepositTxHash] = useState("");

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const steps = ["Validator", "Withdrawal", "Deposit"];
  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return (
          <StepSelectValidator
            validatorAccount={validatorAccount}
            setValidatorAccount={setValidatorAccount}
            onNext={handleNext}
            onBack={onExit}
          />
        );
      case 1:
        return (
          <StepSelectWithdrawal
            withdrawalAccount={withdrawalAccount}
            setWithdrawalAccount={setWithdrawalAccount}
            onNext={handleNext}
            onBack={onExit}
          />
        );
      case 2:
        return (
          <StepDeposit
            validatorAccount={validatorAccount}
            withdrawalAccount={withdrawalAccount}
            setDepositTxHash={setDepositTxHash}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
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
            <Link href={urlJoin(goerliTxViewer, depositTxHash)}>
              {depositTxHash}
            </Link>
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
