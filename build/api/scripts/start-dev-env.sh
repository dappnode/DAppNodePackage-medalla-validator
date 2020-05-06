concurrently -n ui,server \
  "cd ui && yarn mock" \
  "cd server && yarn mock" \