export interface RequestStatus<R> {
  result?: R;
  loading?: boolean;
  error?: string | Error;
}
