import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import params from "params";
import { formatEth } from "utils";

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    display: "flex",
    "& > .MuiIconButton-root": {
      alignSelf: "center",
      "& > span > svg": {
        fontSize: "2.5rem",
      },
    },
  },
  numberInput: {
    width: "100%",
    marginRight: "1rem",
    fontSize: "2rem",
    "& > div > input": {
      fontSize: "1.8rem",
    },
  },
}));

export function ValidatorCountDialog({
  open,
  balance,
  addValidators,
  onClose,
}: {
  open: boolean;
  balance: number;
  addValidators: (num: number) => void;
  onClose: () => void;
}) {
  const maxNumber = Math.floor(balance / params.validatorCost);
  const minNumber = 1;
  const [num, setNum] = useState(maxNumber);

  const onMinus = () => setNum((n) => n - 1);
  const onAdd = () => setNum((n) => n + 1);
  const onMax = () => setNum(maxNumber);
  const onSet = (newNum: number) => setNum(newNum);

  function onConfirm() {
    addValidators(Math.floor(num));
    onClose();
    setNum(1);
  }

  const errors: string[] = [];
  if (num > maxNumber)
    errors.push(`You only have balance for ${maxNumber} validators`);
  if (num < minNumber)
    errors.push(`You have to add at least ${minNumber} validator`);
  if (num < 0) errors.push(`Negative validators =D`);

  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Number of validators to add?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          You need to deposit 32ETH per validator that you wish to add. This
          process cannot be reversed. I understand that I can not transfer my
          staked ETH until at least phase 1, and I can not withdraw until phase
          2.
        </DialogContentText>

        <Box my={4} className={classes.inputContainer}>
          <TextField
            value={num}
            onChange={(e) => onSet(parseInt(e.target.value))}
            label="Validators"
            variant="outlined"
            type="integer"
            className={classes.numberInput}
            error={errors.length > 0}
            helperText={errors.join("\n")}
          />

          <IconButton aria-label="add" onClick={onMinus}>
            <RemoveIcon />
          </IconButton>
          <IconButton aria-label="substract" onClick={onAdd}>
            <AddIcon />
          </IconButton>
          <IconButton aria-label="max" onClick={onMax}>
            MAX
          </IconButton>
        </Box>

        <Box my={2}>
          <Typography
            variant="h5"
            color={num > maxNumber ? "error" : "textSecondary"}
          >
            {num * 32} / {formatEth(balance)} ETH
          </Typography>
          <Typography variant="caption" color="textSecondary">
            ETH to be transfered from the internal account
          </Typography>
        </Box>

        <DialogActions>
          <Button onClick={onClose} color="primary">
            Back
          </Button>
          <Button
            color="primary"
            variant="contained"
            autoFocus
            disabled={!num || errors.length > 0}
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
