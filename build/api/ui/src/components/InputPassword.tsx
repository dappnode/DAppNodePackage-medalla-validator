import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl, { FormControlTypeMap } from "@material-ui/core/FormControl";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";

export function InputPassword({
  password,
  setPassword,
  id = "password-toogle-show",
  ...props
}: {
  password: string;
  setPassword: (password: string) => void;
  id?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <FormControl variant="outlined" margin="normal" fullWidth required>
      <InputLabel htmlFor={id}>Password</InputLabel>
      <OutlinedInput
        id={id}
        type={show ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShow((s) => !s)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {show ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        }
        labelWidth={90}
        name="password"
        autoComplete="current-password"
      />
    </FormControl>
  );
}
