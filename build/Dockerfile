################
# UI build
################

FROM node:10.20.1-alpine as build-ui
WORKDIR /app
# Copy and install deps first to cache
COPY api/ui/package.json api/ui/yarn.lock ./
RUN yarn
COPY api/ui .
RUN yarn schemas-generate
RUN yarn build
# Results in build/*

################
# Server build
################

FROM node:10.20.1-alpine as build-server
WORKDIR /app
COPY api/server/package.json api/server/yarn.lock ./
RUN yarn
COPY api/server .
COPY --from=build-ui /app/src/common ../ui/src/common
RUN yarn build
# Results in build/index.js

################
# Final layer
################

FROM alpine
WORKDIR /app
# Lightest way to have node in alpine
RUN apk add --update nodejs

ENV SERVER_PORT 80
ENV CLIENT_FILES_PATH dist
ENV DATA_PATH /app/data

# Copy index.js and source-maps
COPY --from=build-ui /app/build /app/${CLIENT_FILES_PATH}
COPY --from=build-server /app/build /app

CMD [ "node", "/app" ]