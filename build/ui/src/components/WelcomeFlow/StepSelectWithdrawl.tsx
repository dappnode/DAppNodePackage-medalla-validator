import React from "react";
import { Box, Typography } from "@material-ui/core";
import { SelectWithdrawlAccount } from "components/Account/SelectAccount";
import { NavButtons } from "./NavButtons";

export function StepSelectWithdrawl({
  withdrawlAccount,
  setWithdrawlAccount,
  onNext,
  onBack,
}: {
  withdrawlAccount: string;
  setWithdrawlAccount: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Select withdrawl account
      </Typography>
      <Typography gutterBottom>
        This account will receive the validator funds after an exit
      </Typography>
      <Box mt={3}>
        <SelectWithdrawlAccount
          withdrawlAccount={withdrawlAccount}
          setWithdrawlAccount={setWithdrawlAccount}
        />
      </Box>

      <NavButtons
        onNext={onNext}
        onBack={onBack}
        disableNext={!withdrawlAccount}
        nextLabel="Select account"
      ></NavButtons>
    </React.Fragment>
  );
}
