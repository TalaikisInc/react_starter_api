#!/bin/bash

head -n -1 postgrest.conf > temp.conf
mv temp.conf postgrest.conf
PASS="$(openssl rand -base64 32 2>&1)"
echo "jwt-secret = \"$PASS\"" >> postgrest.conf
