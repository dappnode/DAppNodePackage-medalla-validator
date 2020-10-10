import React from "react";
import {
  makeStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
} from "@material-ui/core";
import { SelectValidatorClient } from "./SelectValidatorClient";
import { AppSettings } from "common";
import { SelectBeaconProvider } from "./SelectBeaconProvider";
import { EF_LAUNCHPAD_URL } from "params";
import { noAStyle, newTabProps } from "utils";
import { Link } from "react-router-dom";
import { paths } from "paths";
import { Alert } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    marginBottom: theme.spacing(2),
  },
  importWarning: {
    marginTop: theme.spacing(2),
  },
  importValidators: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: theme.spacing(4),
  },
}));

function getSteps() {
  return [
    "Select beacon node provider",
    "Select validator client",
    "Import validators",
  ];
}

export function OnboardingDialog({
  open,
  onClose,
  appSettings,
  revalidateSettings,
}: {
  open: boolean;
  onClose: () => void;
  appSettings: AppSettings;
  revalidateSettings: () => void;
}) {
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  const classes = useStyles();

  const handleNext = () => {
    if (activeStep >= steps.length - 1) onClose();
    else setActiveStep((prevStep) => prevStep + 1);
  };

  function getStepContent(stepIndex: number) {
    switch (stepIndex) {
      case 0:
        return (
          <>
            <Typography>
              Welcome to the Zinken validator onboarding! First, select a Beacon
              node provider that all validators connect to, to fetch duties and
              publish attestations and blocks
            </Typography>
            <SelectBeaconProvider
              appSettings={appSettings}
              onSuccess={() => {
                revalidateSettings();
                handleNext();
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            <Typography>
              Select a validator client used to validate with all provided
              keystores. You can change it latter.
            </Typography>
            <SelectValidatorClient
              appSettings={appSettings}
              onSuccess={() => {
                revalidateSettings();
                handleNext();
              }}
            />
          </>
        );
      case 2:
        return (
          <>
            <Typography>
              To finish, import you validator(s) keystores. You can generate new
              ones on the official Ethereum Foundation Eth2.0 Launchpad. This is
              the recommended and most secure way of generating these keystores.
            </Typography>

            <Alert severity="warning" className={classes.importWarning}>
              When using the Eth2.0 Launchpad be extremely careful with phishing
              attacks
            </Alert>

            <div className={classes.importValidators}>
              <a href={EF_LAUNCHPAD_URL} style={noAStyle} {...newTabProps}>
                <Button variant="outlined" color="primary">
                  Generate
                  <br />
                  validators
                </Button>
              </a>
              <Link to={paths.validatorsImport} style={noAStyle}>
                <Button variant="contained" color="primary">
                  Import
                  <br />
                  validators
                </Button>
              </Link>
            </div>
          </>
        );
      default:
        return "Unknown stepIndex";
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Zinken validator onboarding
      </DialogTitle>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, i) => (
          <Step key={label} onClick={() => setActiveStep(i)}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <DialogContent className={classes.dialogContent}>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed, ready to start validating!
            </Typography>
          </div>
        ) : (
          getStepContent(activeStep)
        )}
      </DialogContent>
    </Dialog>
  );
}
