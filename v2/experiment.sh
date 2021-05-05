#!/bin/bash

export CAHRS_GENERATION_SIZE=80
export CAHRS_GENERATIONS=40

## Run movielens
CAHRS_EXPERIMENT=movielens npm run run:mem
CAHRS_NORMALIZE=true CAHRS_EXPERIMENT=movielens npm run run:mem

## Run sobazaar
CAHRS_EXPERIMENT=sobazaar npm run run:mem
CAHRS_NORMALIZE=true CAHRS_EXPERIMENT=sobazaar npm run run:mem
