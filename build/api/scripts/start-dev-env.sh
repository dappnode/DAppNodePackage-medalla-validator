concurrently -n ui,server,schemas \
  "cd ui && yarn mock" \
  "cd server && yarn dev" \
  "cd ui && yarn schemas-watch" \