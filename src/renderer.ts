import {Generation} from "./generation.ts";

const LOADING_BAR_LENGTH = 50

let renderer: Renderer

export function getRenderer() {
    if (!renderer) {
        renderer = new Renderer()
    }

    return renderer
}

class Renderer {
    private generation: Generation | null = null

    private recentStatus = ""

    private progress: number | null = null
    private maxProgress: number | null = null
    private deltaProgress: number = 1

    public setActive(generation: Generation | null) {
        this.generation = generation
    }

    public setProgress(progress: number, maxProgress: number) {
        if (maxProgress != this.maxProgress && maxProgress > LOADING_BAR_LENGTH) {
            this.deltaProgress = Math.floor(maxProgress / LOADING_BAR_LENGTH )
        }
        if (progress % this.deltaProgress === 0) {
            this.progress = progress
            this.maxProgress = maxProgress
            this.updated()
        }
    }

    public finishProgress() {
        this.progress = null
        this.maxProgress = null
        this.deltaProgress = 1
    }

    public updated(status?: string) {
        if (status) {
            this.recentStatus = status
        }
        if (this.generation) {
            this.renderGeneration()
        } else {
            this.renderInitializing()
        }

        console.log("Output:")
        console.log(this.recentStatus)
        this.renderProgress()
    }

    private renderInitializing() {
        console.clear()
        console.log("loading..")
    }

    private renderGeneration() {
        console.clear()

        this.generation?.print()
    }

    private renderProgress() {
        if (this.progress && this.maxProgress) {
            const loadingBars = Math.floor((this.progress * LOADING_BAR_LENGTH) / this.maxProgress)
            const bar = [...Array(LOADING_BAR_LENGTH).keys()].map(i => i < loadingBars ? "-" : " ").join("")
            console.log(`[${bar}] ${this.progress}/${this.maxProgress}`)
        }
    }
}