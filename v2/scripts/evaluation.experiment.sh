#!/bin/bash
cd ..
echo "########################################################"
echo "########################################################"
echo "### ATTENTION: Make sure results cache is CLEARED if ###"
echo "### something has changed in fitness calculations!   ###"
echo "########################################################"
echo "########################################################"

############################################################
### (Default) Experiment settings                                  ###
############################################################
export CAHRS_EXPERIMENT_NAME=$1
export CAHRS_ENABLE_CACHE=true
export CAHRS_CACHE_DIRECTORY=${CAHRS_CACHE_DIRECTORY:-/data/cache/}

mkdir -p ${CAHRS_CACHE_DIRECTORY}results

############################################################
### Search hyperparameters                               ###
############################################################
export CAHRS_GENERATION_SIZE=${CAHRS_GENERATION_SIZE:-200}
export CAHRS_GENERATIONS=${CAHRS_GENERATIONS:-40}
export CAHRS_TOURNAMENT_SIZE=${CAHRS_TOURNAMENT_SIZE:-4}

export CAHRS_INTERLEAVE_SIZE=1

############################################################
### Run experiments                                      ###
### CHANGE BELOW!                                        ###
############################################################
parallel --ungroup \
  CAHRS_MUTATION_RATE={1} \
  CAHRS_CROSSOVER_RATE={2} \
  CAHRS_PARAM_MUTATION_RATE={3} \
  CAHRS_PARAM_MUTATION_SPEED={4} \
  CAHRS_ELITISM={5} \
  CAHRS_INITIAL_DEPTH={6} \
  CAHRS_MAX_DEPTH={7} \
  CAHRS_EXPERIMENT_NAME={8} \
  CAHRS_PROBLEM={9} \
  CAHRS_EVALUATION={10} \
  npm run run:mem \
  ::: `# MUTATION_RATE       ` 0.1 \
  ::: `# CROSSOVER_RATE      ` 0.9 \
  ::: `# PARAM_MUTATION_RATE ` 0.9 \
  ::: `# PARAM_MUTATION_SPEED` 0.1 \
  ::: `# ELITISM             ` 0.05 \
  ::: `# INITIAL_DEPTH       ` 5 \
  ::: `# MAX_DEPTH           ` 6 \
  ::: `# EXPERIMENT_NAME     ` evaluation \
  ::: `# PROBLEM             ` movielens \
  ::: `# EVALUATION          ` mrr precision10 precision1 recall

