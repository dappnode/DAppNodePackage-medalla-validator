################
# UI build
################
FROM node:stretch-slim as build-ui
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
FROM node:stretch-slim as build-server
WORKDIR /app
COPY api/server/package.json api/server/yarn.lock ./
RUN yarn
COPY api/server .
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
# nodejs binary 
################
FROM debian:stretch-slim as nodejs-binary

ENV NODE_VERSION 14.2.0

RUN ARCH= && dpkgArch="$(dpkg --print-architecture)" \
	&& case "${dpkgArch##*-}" in \
	amd64) ARCH='x64';; \
	ppc64el) ARCH='ppc64le';; \
	s390x) ARCH='s390x';; \
	arm64) ARCH='arm64';; \
	armhf) ARCH='armv7l';; \
	i386) ARCH='x86';; \
	*) echo "unsupported architecture"; exit 1 ;; \
	esac \
	&& set -ex \
	&& apt-get update && apt-get install -y ca-certificates curl wget gnupg dirmngr xz-utils --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& for key in \
	94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
	FD3A5288F042B6850C66B31F09FE44734EB7990E \
	71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
	DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
	C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
	B9AE9905FFD7803F25714661B63B535A4C206CA9 \
	77984A986EBC2AA786BC0F66B01FBB92821C587A \
	8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
	4ED778F539E3634C779C87C6D7062848A1AB005C \
	A48C2BEE680E841632CD4E44F07496B3EB3C1762 \
	B9E2F5981AA6E0CD28160D9FF13993A75599653C \
	; do \
	gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
	gpg --batch --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
	gpg --batch --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
	done \
	&& curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.xz" \
	&& curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
	&& gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
	&& grep " node-v$NODE_VERSION-linux-$ARCH.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
	&& mkdir /usr/local/tmp \
	&& tar -xJf "node-v$NODE_VERSION-linux-$ARCH.tar.xz" -C /usr/local/tmp --strip-components=1 --no-same-owner \
	&& rm "node-v$NODE_VERSION-linux-$ARCH.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
	&& apt-mark auto '.*' > /dev/null \
	&& find /usr/local/tmp -type f -executable -exec ldd '{}' ';' \
	| awk '/=>/ { print $(NF-1) }' \
	| sort -u \
	| xargs -r dpkg-query --search \
	| cut -d: -f1 \
	| sort -u \
	| xargs -r apt-mark manual \
	&& apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
	&& ln -s /usr/local/tmp/bin/node /usr/local/bin/node \
	&& ln -s /usr/local/tmp/bin/node /usr/local/bin/nodejs \
	&& ln -s /usr/local/tmp/bin/npm /usr/local/bin/npm \
	# smoke tests
	&& node --version \
	&& npm --version

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

ENV SERVER_PORT 80
ENV CLIENT_FILES_PATH dist
ENV DATA_PATH /app/data
ENV WORKDIR /app

WORKDIR ${WORKDIR}

COPY --from=ethdo-binary /go/bin/ethdo /usr/local/bin/ 
COPY --from=nodejs-binary /usr/local/tmp /tmp 
COPY --from=validator-binary /usr/local/bin/validator /usr/local/bin/
COPY --from=build-ui /app/build ${WORKDIR}/${CLIENT_FILES_PATH}
COPY --from=build-server /app/build ${WORKDIR}/server

RUN cp /tmp/bin/node /usr/bin/ && \
	/tmp/bin/npm install -g pm2 --production && \
	ln -s /root/.config/ethereum2 ${DATA_PATH} && \
	rm -f /usr/local/lib/dtrace/node.d && \
	rm -rf ~/.npm && \
	rm -rf /tmp/*

ADD app $WORKDIR

ENTRYPOINT ["pm2-runtime", "/app/pm2/ecosystem.config.js"]
