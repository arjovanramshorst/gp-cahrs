#!/bin/bash

if [[ -z $1 ]]; then
  echo "Please add an experiment name as argument"
  exit 1
fi

echo "####################################################"
echo "####################################################"
echo "# ATTENTION: Make sure results cache is CLEARED if #"
echo "# something has changed in fitness calculations!   #"
echo "####################################################"
echo "####################################################"

export CAHRS_EXPERIMENT_NAME=$1

export CAHRS_GENERATION_SIZE=400
export CAHRS_CACHE_DIRECTORY=/data/cache/


export CAHRS_GENERATIONS=50

export CAHRS_INTERLEAVE_SIZE=1
export CAHRS_PROBLEM=movielens2
export CAHRS_MAX_DEPTH=5
export CAHRS_ENABLE_CACHE=true


export CAHRS_MUTATION_RATE=0.1
export CAHRS_CROSSOVER_RATE=0.9
export CAHRS_PARAM_MUTATION_RATE=0.1
export CAHRS_PARAM_MUTATION_SPEED=0.5
export CAHRS_ELITISM=0.05

CAHRS_EXPERIMENT_NAME=$1-1 npm run run:mem &
CAHRS_EXPERIMENT_NAME=$1-2 npm run run:mem &
CAHRS_EXPERIMENT_NAME=$1-3 npm run run:mem &
CAHRS_EXPERIMENT_NAME=$1-4 npm run run:mem 

#export CAHRS_PARAM_MUTATION_RATE=0.5
# Disable before committing
#export CAHRS_ONLY_BASELINE=true

# export CAHRS_PARAM_MUTATION_SPEED=0.1
# CAHRS_MUTATION_RATE=1 CAHRS_CROSSOVER_RATE=1 npm run run:mem
# CAHRS_MUTATION_RATE=0.1 CAHRS_CROSSOVER_RATE=0.9 npm run run:mem
# CAHRS_MUTATION_RATE=0 CAHRS_CROSSOVER_RATE=1 npm run run:mem

# export CAHRS_PARAM_MUTATION_SPEED=0.3
# CAHRS_MUTATION_RATE=1 CAHRS_CROSSOVER_RATE=1 npm run run:mem
# CAHRS_MUTATION_RATE=0.1 CAHRS_CROSSOVER_RATE=0.9 npm run run:mem
# CAHRS_MUTATION_RATE=1 CAHRS_CROSSOVER_RATE=0 npm run run:mem
# CAHRS_MUTATION_RATE=0 CAHRS_CROSSOVER_RATE=1 npm run run:mem

# export CAHRS_PARAM_MUTATION_SPEED=0.5
# CAHRS_MUTATION_RATE=1 CAHRS_CROSSOVER_RATE=1 npm run run:mem
# CAHRS_MUTATION_RATE=0.1 CAHRS_CROSSOVER_RATE=0.9 npm run run:mem
# CAHRS_MUTATION_RATE=1 CAHRS_CROSSOVER_RATE=0 npm run run:mem
# CAHRS_MUTATION_RATE=0 CAHRS_CROSSOVER_RATE=1 npm run run:mem

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
