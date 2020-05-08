FROM golang:alpine3.11 as ethdo-binary

RUN apk add -U build-base
RUN GO111MODULE=on go get github.com/wealdtech/ethdo

FROM gcr.io/prysmaticlabs/prysm/validator@sha256:6aaba9ac4c09cd8bcbb902347d0ce0ea8d5df970d69b07242dfb281350bb21bd as validator-binary

FROM alpine

WORKDIR /usr/src/app


COPY --from=ethdo-binary /go/bin/ethdo /usr/local/bin/
COPY --from=validator-binary /app/validator/image.binary.runfiles/prysm/validator/linux_amd64_stripped/image.binary /usr/local/bin/validator

RUN apk add -U libstdc++ libc6-compat ca-certificates nodejs bash && \
	ln -s /root/.config/ethereum2 /usr/src/app/ethereum2 && \
	apk add --no-cache --virtual .build-deps npm && \
	npm install -g pm2 --production && \
	npm install -g fs --production && \
	apk del .build-deps

ADD app /usr/src/app/
ADD ssl /ssl/

CMD ["pm2-runtime", "/usr/src/app/ecosystem.config.js"]

