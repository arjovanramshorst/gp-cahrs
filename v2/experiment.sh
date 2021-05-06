#!/bin/bash

export CAHRS_EXPERIMENT_NAME=$1

export CAHRS_GENERATION_SIZE=80

export CAHRS_GENERATIONS=60

## Run movielens
CAHRS_PROBLEM=movielens npm run run:mem

## Run sobazaar
CAHRS_PROBLEM=sobazaar npm run run:mem
