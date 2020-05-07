import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { InputPassword } from "components/InputPassword";
import SelectWithdrawlAccount from "components/withdrawl/SelectWithdrawlAccount";

export function WithdrawlAccountCreation({
  password,
  setPassword,
}: {
  password: string;
  setPassword: (password: string) => void;
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
        <SelectWithdrawlAccount />
      </Box>
    </React.Fragment>
  );
}
