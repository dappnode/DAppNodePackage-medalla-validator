concurrently -n ui,server,common \
  "cd ui && yarn mock" \
  "cd server && yarn mock" \
  "cd server && yarn common-watch" \