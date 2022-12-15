#!/bin/bash

# This script is for quick building & deploying of the program.


if [ $1 == "reset" ];
then
    rm -rf target/deploy
fi

cargo build-bpf
solana program deploy ./target/deploy/prestige_program.so --keypair ~/.config/solana/prestige/main/main.json