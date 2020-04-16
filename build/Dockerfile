FROM ubuntu as binary

ARG VERSION
ENV DOWNLOAD_URL https://github.com/prysmaticlabs/prysm/releases/download
ENV BINARY_URL $DOWNLOAD_URL/$VERSION/validator-$VERSION-linux-amd64

RUN apt update && \
    apt install -y wget && \
    wget $BINARY_URL -O /usr/local/bin/validator && \
    chmod +x  /usr/local/bin/validator


FROM ubuntu

#Copy binaries from build stage
COPY --from=binary /usr/local/bin/validator /usr/local/bin/validator

#Copy binaries from build stage
COPY entrypoint.sh /usr/local/bin/entrypoint

ADD ssl /ssl/

ENTRYPOINT ["entrypoint"]
