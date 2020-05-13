import React from "react";
import { Box, Typography } from "@material-ui/core";
import { SelectValidatorAccount } from "components/Account/SelectAccount";
import { NavButtons } from "./NavButtons";

export function StepSelectValidator({
  validatorAccount,
  setValidatorAccount,
  onNext,
  onBack,
}: {
  validatorAccount: string;
  setValidatorAccount: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Select validator account
      </Typography>
      <Typography gutterBottom>
        This account will perform validator duties
      </Typography>
      <Box mt={3}>
        <SelectValidatorAccount
          validatorAccount={validatorAccount}
          setValidatorAccount={setValidatorAccount}
        />
      </Box>

      <NavButtons
        onNext={onNext}
        onBack={onBack}
        disableNext={!validatorAccount}
        nextLabel="Select account"
      ></NavButtons>
    </React.Fragment>
  );
}
