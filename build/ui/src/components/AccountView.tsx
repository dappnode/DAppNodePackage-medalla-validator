import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  TextField,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { ExpandIcon } from "img/ExpandIcon";

const useStyles = makeStyles((theme) => ({
  accountAddress: {
    lineHeight: 1,
  },
  accountContainer: {
    marginBottom: "0.15rem",
    // Clicable
    "&:hover": {
      color: theme.palette.primary.main,
    },
    cursor: "pointer",
    // Mimic Aragon account viewer, add opacity to be compatible in dark mode
    backgroundColor: theme.palette.primary.main + "1f",
    alignSelf: "flex-start",
    padding: "2px",
    borderRadius: "4px",
  },
  iconOpen: {
    color: theme.palette.primary.main,
    display: "flex",
    marginLeft: "0.25rem",
    "& > svg": {
      fontSize: "1rem",
      "& > path": {
        // Specific coloring for Grommet/Expand
        stroke: theme.palette.primary.main,
      },
    },
  },
}));

export function AccountView({ address }: { address: string }) {
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const accountShort = address.slice(0, 6) + "..." + address.slice(-4);

  const classes = useStyles();

  return (
    <>
      <Box
        display="flex"
        className={classes.accountContainer}
        onClick={handleClickOpen}
      >
        <Typography className={classes.accountAddress}>
          {accountShort}
        </Typography>
        <Box className={classes.iconOpen}>
          <ExpandIcon></ExpandIcon>
        </Box>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Internal Eth1 account</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Internal Eth1 account exclusively used to fund validator deposits
          </DialogContentText>

          <Box mb={3}>
            <Alert severity="warning">
              Do not send real ETH to this account, only Goerli test ETH
            </Alert>
          </Box>

          <TextField
            value={address}
            label="Address"
            variant="outlined"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Back
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
