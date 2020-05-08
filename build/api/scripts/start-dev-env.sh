concurrently -n ui,server,common \
  "cd ui && yarn mock" \
  "cd server && yarn dev" \
  "cd server && yarn common-watch" \