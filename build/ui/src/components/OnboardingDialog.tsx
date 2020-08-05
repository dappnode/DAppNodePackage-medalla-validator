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
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
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
  bottomButtons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: theme.spacing(2),
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

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep < 1 ? 0 : prevStep - 1));
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  function getStepContent(stepIndex: number) {
    switch (stepIndex) {
      case 0:
        return (
          <>
            <Typography>
              Welcome to the Medalla validator onboarding! First, select a
              Beacon node provider that all validators connect to, to fetch
              duties and publish attestations and blocks
            </Typography>
            <SelectBeaconProvider
              appSettings={appSettings}
              revalidateSettings={revalidateSettings}
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
              revalidateSettings={revalidateSettings}
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
        Medalla validator onboarding
      </DialogTitle>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <DialogContent className={classes.dialogContent}>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed
            </Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          getStepContent(activeStep)
        )}

        <div className={classes.bottomButtons}>
          <Button
            color="primary"
            disabled={activeStep === 0}
            onClick={handleBack}
            className={classes.backButton}
          >
            Back
          </Button>
          <Button variant="contained" color="primary" onClick={handleNext}>
            {activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
