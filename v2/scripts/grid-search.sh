#!/bin/bash
cd ..

if [[ -z $1 ]]; then
  echo "Please add an experiment name as argument"
  exit 1
fi

echo "########################################################"
echo "########################################################"
echo "### ATTENTION: Make sure results cache is CLEARED if ###"
echo "### something has changed in fitness calculations!   ###"
echo "########################################################"
echo "########################################################"

############################################################
### Experiment settings                                  ###
############################################################
export CAHRS_EXPERIMENT_NAME=$1
export CAHRS_ENABLE_CACHE=true
export CAHRS_CACHE_DIRECTORY=/data/cache/

mkdir -p ${CAHRS_CACHE_DIRECTORY}results

export CAHRS_PROBLEM=movielens2

############################################################
### Search hyperparameters                               ###
############################################################
export CAHRS_GENERATION_SIZE=${CAHRS_GENERATION_SIZE:-100}
export CAHRS_GENERATIONS=${CAHRS_GENERATIONS:-20}
export CAHRS_TOURNAMENT_SIZE=${CAHRS_TOURNAMENT_SIZE:-2}

export CAHRS_INTERLEAVE_SIZE=1

export CAHRS_MUTATION_RATE=0.1
export CAHRS_CROSSOVER_RATE=0.9
export CAHRS_PARAM_MUTATION_RATE=0.1
export CAHRS_PARAM_MUTATION_SPEED=0.5
export CAHRS_ELITISM=0.05


############################################################
### Solution space hyperparamters:                       ###
############################################################
export CAHRS_INITIAL_DEPTH=5
export CAHRS_MAX_DEPTH=8


############################################################
### Run experiments                                      ###
### CHANGE BELOW!                                        ###
############################################################
parallel \
  CAHRS_MUTATION_RATE={1} \
  CAHRS_CROSSOVER_RATE={2} \
  CAHRS_PARAM_MUTATION_RATE={3} \
  CAHRS_PARAM_MUTATION_SPEED={4} \
  CAHRS_ELITISM={5} \
  CAHRS_INITIAL_DEPTH={6} \
  CAHRS_MAX_DEPTH={7} \
  CAHRS_EXPERIMENT_NAME={8} \
  npm run run:mem \
  :::  `# MUTATION_RATE       ` 1 0 0.1 0.9 1 \
  :::+ `# CROSSOVER_RATE      ` 1 1 0.9 0.1 0 \
  :::  `# PARAM_MUTATION_RATE ` 0.1 0.5 0.9  \
  :::  `# PARAM_MUTATION_SPEED` 0.5 0.1 \
  :::  `# ELITISM             ` 0.05 0 \
  :::  `# INITIAL_DEPTH       ` 5 \
  :::  `# MAX_DEPTH           ` 8 \
  :::  `# EXPERIMENT_NAME     ` grid-search \

