#!/bin/bash

if [[ -z $1 ]]; then
  echo "Please add an experiment name as argument"
  exit 1
fi

export CAHRS_EXPERIMENT_NAME=$1

export CAHRS_GENERATION_SIZE=40

export CAHRS_GENERATIONS=60

export CAHRS_INTERLEAVE_SIZE=0.2

# Disable before committing
#export CAHRS_ONLY_BASELINE=true

## Run movielens
#CAHRS_MAX_DEPTH=3 CAHRS_PROBLEM=movielens npm run run:mem
#CAHRS_MAX_DEPTH=4 CAHRS_PROBLEM=movielens npm run run:mem
#CAHRS_MAX_DEPTH=5 CAHRS_PROBLEM=movielens npm run run:mem
#CAHRS_MAX_DEPTH=6 CAHRS_PROBLEM=movielens npm run run:mem

## Run sobazaar
CAHRS_MAX_DEPTH=3 CAHRS_PROBLEM=sobazaar npm run run:mem
CAHRS_MAX_DEPTH=4 CAHRS_PROBLEM=sobazaar npm run run:mem
CAHRS_MAX_DEPTH=5 CAHRS_PROBLEM=sobazaar npm run run:mem
CAHRS_MAX_DEPTH=6 CAHRS_PROBLEM=sobazaar npm run run:mem
