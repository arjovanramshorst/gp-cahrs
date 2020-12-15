import {Generation} from "./generation.ts";

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

    public setActive(generation: Generation | null) {
        this.generation = generation
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
    }

    private renderInitializing() {
        console.clear()
        console.log("loading..")
    }

    private renderGeneration() {
        console.clear()

        this.generation?.print()
    }
}