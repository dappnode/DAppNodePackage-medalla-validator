################
# UI build
################
FROM node:stretch-slim as build-ui
WORKDIR /app
# Copy and install deps first to cache
COPY ui/package.json ui/yarn.lock ./
RUN yarn
COPY ui .
RUN yarn schemas-generate
RUN yarn build
# Results in build/*

################
# Server build
################
FROM node:stretch-slim as build-server
WORKDIR /app
COPY server/package.json server/yarn.lock ./
RUN yarn
COPY server .
COPY --from=build-ui /app/src/common ../ui/src/common
RUN yarn build
# Results in build/index.js

################
# ethdo binary
################
FROM golang:stretch as ethdo-binary

RUN DEBIAN_FRONTEND=noninteractive \
  apt update && apt install --assume-yes --no-install-recommends \
  build-essential \
  && rm -rf /var/lib/apt/lists/*
RUN GO111MODULE=on go get github.com/wealdtech/ethdo

################
# Prysm binary
################
FROM debian:stretch-slim as validator-binary

ARG VERSION
ENV DOWNLOAD_URL https://github.com/prysmaticlabs/prysm/releases/download
ENV BINARY_URL $DOWNLOAD_URL/$VERSION/validator-$VERSION-linux-amd64

RUN DEBIAN_FRONTEND=noninteractive \
  apt update && apt install --assume-yes --no-install-recommends wget ca-certificates && \
  wget $BINARY_URL -O /usr/local/bin/validator && \
  chmod +x  /usr/local/bin/validator && \
  rm -rf /var/lib/apt/lists/*

################
# Final layer
################
FROM debian:stretch-slim

ENV NODE_ENV production
ENV SERVER_PORT 80
ENV CLIENT_FILES_PATH dist
ENV DATA_PATH /app/data
ENV DB_API_DIR /app/db-api
ENV WORKDIR /app

WORKDIR ${WORKDIR}

ADD ssl /app/ssl
COPY --from=node:10.20.1-stretch-slim /usr/local/bin/node /usr/local/bin
COPY --from=ethdo-binary /go/bin/ethdo /usr/local/bin/ 
COPY --from=validator-binary /usr/local/bin/validator /usr/local/bin/
COPY --from=build-ui /app/build ${CLIENT_FILES_PATH}
COPY --from=build-server /app/build server

RUN ln -s /root/.config/ethereum2 ${DATA_PATH}

CMD ["node", "server"]
