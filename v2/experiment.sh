#!/bin/bash

if [[ -z $1 ]]; then
  echo "Please add an experiment name as argument"
  exit 1
fi

export CAHRS_EXPERIMENT_NAME=$1

export CAHRS_GENERATION_SIZE=200

export CAHRS_GENERATIONS=30

export CAHRS_INTERLEAVE_SIZE=1
export CAHRS_PROBLEM=movielens2
export CAHRS_MAX_DEPTH=4
export CAHRS_ENABLE_CACHE=true

# Disable before committing
#export CAHRS_ONLY_BASELINE=true

CAHRS_MUTATION_RATE=1 CAHRS_CROSSOVER_RATE=1 npm run run:mem
CAHRS_MUTATION_RATE=0.1 CAHRS_CROSSOVER_RATE=0.9 npm run run:mem
CAHRS_MUTATION_RATE=1 CAHRS_CROSSOVER_RATE=0 npm run run:mem

## Run movielens
#CAHRS_MAX_DEPTH=3 CAHRS_PROBLEM=movielens npm run run:mem
#CAHRS_MAX_DEPTH=4 CAHRS_PROBLEM=movielens2 npm run run:mem
#CAHRS_MAX_DEPTH=5 CAHRS_PROBLEM=movielens2 npm run run:mem
#CAHRS_MAX_DEPTH=6 CAHRS_PROBLEM=movielens npm run run:mem

## Run sobazaar
#CAHRS_MAX_DEPTH=3 CAHRS_PROBLEM=sobazaar npm run run:mem
#CAHRS_MAX_DEPTH=4 CAHRS_PROBLEM=sobazaar npm run run:mem
#CAHRS_MAX_DEPTH=5 CAHRS_PROBLEM=sobazaar npm run run:mem
#CAHRS_MAX_DEPTH=6 CAHRS_PROBLEM=sobazaar npm run run:mem
