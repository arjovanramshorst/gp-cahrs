# CAHRS-GP

CAHRS-GP (Context Aware Hybrid Recommender Systems - Genetic Programming) uses genetic programming
to automatically generate and improve recommender systems given a random (annotated) dataset. It is
written in Typescript and built on the Deno runtime. 

## How to run


### Linux:
The `./run.sh` script does everything for you.

    # Make ./run.sh executable:
    chmod +x ./run.sh
    
    # Run with default settings, if Deno is not installed, it will install
    # it automatically
    ./run.sh
    
    # Run performance test:
    ./run.sh perf <type> <repetitions>
    
    # Run evaluation:
    ./run.sh test <type>

### Windows/Mac
Install Deno manually: https://deno.land/#installation

Run the following:
    
    # Change directory to src directory
    cd src
    
    # Default 
    deno run --allow-read --v8-flags=--max-old-space-size=8192 main.ts
    
    # Performance test:
    deno run --allow-read --v8-flags=--max-old-space-size=8192 performance.ts <type> <repetitions>
    
    # Preconfigured evaluation:
    deno run --allow-read --v8-flags=--max-old-space-size=8192 test.ts <type>
    
### Available performance & evaluation types
Check `src/performance.ts` and `src/test.ts` for possible values for `<type>`
