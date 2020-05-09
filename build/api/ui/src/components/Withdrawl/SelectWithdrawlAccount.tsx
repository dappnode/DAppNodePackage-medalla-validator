import React, { useState, useEffect } from "react";
import { CreateWithdrawl } from "./CreateWithdrawl";
import { useApi } from "rpc";
// Material UI
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import LinearProgress from "@material-ui/core/LinearProgress";
import { ErrorView } from "components/ErrorView";

const useStyles = makeStyles((theme) => ({
  formGroup: {
    alignItems: "center",
  },
  formControlSelect: {
    flex: "auto",
    marginRight: theme.spacing(2),
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  dialogContent: {
    // Prevent vertical scroll showing up, if the password field in the last
    paddingBottom: theme.spacing(2),
  },
}));

export function SelectWithdrawlAccount({
  withdrawlAccount,
  setWithdrawlAccount,
}: {
  withdrawlAccount: string;
  setWithdrawlAccount: (id: string) => void;
}) {
  const withdrawlAccounts = useApi.accountWithdrawlList();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!withdrawlAccount && withdrawlAccounts.data) {
      const first = withdrawlAccounts.data[0];
      if (first) setWithdrawlAccount(first.id);
    }
  }, [withdrawlAccounts.data, withdrawlAccount, setWithdrawlAccount]);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  const classes = useStyles();

  if (withdrawlAccounts.data)
    return (
      <div>
        {withdrawlAccounts.data.length > 0 ? (
          <FormGroup row className={classes.formGroup}>
            <FormControl className={classes.formControlSelect}>
              <InputLabel id="demo-simple-select-helper-label">
                Withdrawl account
              </InputLabel>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={withdrawlAccount}
                onChange={(e) => setWithdrawlAccount(e.target.value as string)}
              >
                {withdrawlAccounts.data.map(({ id, name }) => (
                  <MenuItem key={id} value={id}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Some important helper text</FormHelperText>
            </FormControl>

            <FormControl>
              <Button onClick={openDialog} variant="contained">
                Add
              </Button>
            </FormControl>
          </FormGroup>
        ) : (
          <Button
            onClick={openDialog}
            variant="contained"
            color="primary"
            fullWidth
          >
            Add withdrawl account
          </Button>
        )}

        {/* Dialog to create a withdrawl account */}
        <Dialog open={open} onClose={closeDialog}>
          <DialogContent className={classes.dialogContent}>
            <CreateWithdrawl
              onCreate={() => setTimeout(() => closeDialog(), 500)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={closeDialog} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  if (withdrawlAccounts.isValidating)
    return (
      <Box my={2}>
        <LinearProgress />
      </Box>
    );
  if (withdrawlAccounts.error)
    return (
      <Box my={2}>
        <ErrorView error={withdrawlAccounts.error} />
      </Box>
    );
  return null;
}
