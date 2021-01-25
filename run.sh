#!/bin/bash

cd $(dirname $0)/src

# Check for deno installation, and install if not found
if [[ -z $(which deno) ]]
then
  echo "It appears as though Deno is not installed on this system. Do you want to install it now? (Y/n)"
  while true; do
    read -n 1 yn
    case $yn in
        [Yy]*|* ) echo && curl -fsSL https://deno.land/x/install/install.sh | sh; break;;
        [Nn]* ) echo && echo "Without Deno this script can not run" && exit;;
    esac
  done
fi

if [[ $1 = "perf" ]];
then
  echo "Running performance test"

  deno run --allow-read --v8-flags=--max-old-space-size=8192 performance.ts $2 $3
elif [[ $1 = "test" ]];
then
  echo "Evaluation specific version"
  deno run --allow-read --v8-flags=--max-old-space-size=8192 test.ts $2
else
  deno run --allow-read --allow-write --v8-flags=--max-old-space-size=8192 main.ts
fi

