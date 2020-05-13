import React from "react";
import { Box, Typography } from "@material-ui/core";
import { SelectWithdrawalAccount } from "components/Account/SelectAccount";
import { NavButtons } from "./NavButtons";

export function StepSelectWithdrawal({
  withdrawalAccount,
  setWithdrawalAccount,
  onNext,
  onBack,
}: {
  withdrawalAccount: string;
  setWithdrawalAccount: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Select withdrawal account
      </Typography>
      <Typography gutterBottom>
        This account will receive the validator funds after an exit
      </Typography>
      <Box mt={3}>
        <SelectWithdrawalAccount
          withdrawalAccount={withdrawalAccount}
          setWithdrawalAccount={setWithdrawalAccount}
        />
      </Box>

      <NavButtons
        onNext={onNext}
        onBack={onBack}
        disableNext={!withdrawalAccount}
        nextLabel="Select account"
      ></NavButtons>
    </React.Fragment>
  );
}
