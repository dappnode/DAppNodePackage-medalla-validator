#!/bin/bash

RPC_PROVIDER=prysm-beacon-chain.public.dappnode:4000
LOG=/var/log/validator.log
PASSWORD=${PASSWORD:-}
KEYSTORE=/data
DIR=/data

mkdir -p ${DIR}

while [ -z "$(ls -A -- "$DIR")" ]; do
    echo "Generating a new accounts..."
    validator accounts create --keystore-path=/data --password=${PASSWORD} 2>/dev/null >/data/deposit_data.txt || rm /data/*
    mv /data/validator* /data/validatorprivatekey
    mv /data/shardwithdrawal* /data/shardwithdrawalkey
done

if [ ! -f /data/password ]; then
    echo $PASSWORD > /data/password
elif [[ $PASSWORD != "" ]] && [[ $PASSWORD != $(cat /data/password) ]]; then
    echo $PASSWORD > /data/password
elif [ $PASSWORD == "" ]; then
    export PASSWORD=$(cat /data/password)
fi

exec validator \
    --tls-cert=/ssl/ssl.crt \
    --beacon-rpc-provider=${RPC_PROVIDER} \
    --verbosity=${VERBOSITY} \
    --keymanager=keystore \
    --keymanageropts='{"path":"'${KEYSTORE}'","passphrase":"'${PASSWORD}'"}' \
    --log-file=${LOG} \
    ${EXTRA_OPTS}