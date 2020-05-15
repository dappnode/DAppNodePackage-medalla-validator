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
import LaunchIcon from "@material-ui/icons/Launch";

const useStyles = makeStyles((theme) => ({
  accountAddress: {
    lineHeight: 1,
    marginBottom: "0.15rem",
  },
  clickable: {
    "&:hover": {
      color: theme.palette.primary.main,
    },
    cursor: "pointer",
  },
  iconOpen: {
    color: theme.palette.primary.main,
    display: "flex",
    marginLeft: "0.25rem",
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
        className={classes.clickable}
        onClick={handleClickOpen}
      >
        <Typography className={classes.accountAddress}>
          {accountShort}
        </Typography>
        <Box className={classes.iconOpen}>
          <LaunchIcon fontSize="inherit" />
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
