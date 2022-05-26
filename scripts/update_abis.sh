#!/bin/bash

CONTRACT_REPO=""
CONTRACT_FILES=""
ABIS_DEST=./abis
ABIS_COUNTER=0

. contracts.cfg

update_abis () { 
    mkdir -p .$ABIS_DEST
    CONTRACTS=(${CONTRACT_FILES//,/ })

    for CONTRACT in ${CONTRACTS[@]}; do
        PARTS=(${CONTRACT//// })

        if [[ "${#PARTS[@]}" == 1 ]];
        then
            file="./artifacts/contracts/${PARTS[0]}.sol/${PARTS[0]}.json"

            jq .abi $file > .$ABIS_DEST/${PARTS[0]}.json
        else 
            file="./artifacts/contracts/${PARTS[0]}/${PARTS[1]}.sol/${PARTS[1]}.json"

            jq .abi $file > .$ABIS_DEST/${PARTS[1]}.json
        fi

        let ABIS_COUNTER++
    done

    echo -e "\n--\nCopied $ABIS_COUNTER abis to $DEST"
}

process () {
    npm install && npm run build && update_abis
}

if [[ $CONTRACT_REPO == "" ]];
then
    printf >&2 '\nPlease ensure that CONTRACT_REPO and CONTRACT_FILES are defined in the root `contracts.cfg` file.\n\n'
    exit 1
else
    if mkdir ./contracts || [[ ! -d "./contracts/.git" ]];
    then
        cd contracts
    
        if git clone $CONTRACT_REPO .
        then
            process
        else
            printf >&2 'git clone failed, please see log.\n'
            exit 1
        fi  
    else 
        cd contracts

        if git pull origin main --ff-only
        then
            process
        else
        printf >&2 'git pull failed, please see log.\n'
        exit 1
        fi
    fi
fi
