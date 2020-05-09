export type UserDocument = {
  id: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires: Date;
};
