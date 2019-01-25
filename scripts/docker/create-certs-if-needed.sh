#! /bin/sh
if [[ -e ./secret/certs/cert.crt ]]; then
    echo "Certs already present. Not creating"
else
    echo "Creating self-signed cert"
    mkdir -p ./secret/certs
    openssl req -x509 -newkey rsa:2048 -keyout ./secret/certs/cert.key -out ./secret/certs/cert.crt -days 365 -nodes -subj '/CN=localhost'
fi
