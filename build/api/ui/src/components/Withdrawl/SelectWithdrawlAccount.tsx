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
  setWithdrawlAccount,
}: {
  setWithdrawlAccount: (id: string) => void;
}) {
  const withdrawlAccounts = useApi.accountWithdrawlList();
  const [id, setId] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!id && withdrawlAccounts.data) {
      const first = withdrawlAccounts.data[0];
      if (first) setId(first.id);
    }
  }, [withdrawlAccounts.data, id, setId]);

  useEffect(() => {
    if (id) setWithdrawlAccount(id);
  }, [id, setWithdrawlAccount]);

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
                value={id}
                onChange={(e) => setId(e.target.value as string)}
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
          <Button onClick={openDialog} variant="contained" fullWidth>
            Add withdrawl account
          </Button>
        )}

        {/* Dialog to create a withdrawl account */}
        <Dialog open={open} onClose={closeDialog}>
          <DialogContent className={classes.dialogContent}>
            <CreateWithdrawl />
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
    return <Box my={2}>{withdrawlAccounts.error.message}</Box>;
  return null;
}
