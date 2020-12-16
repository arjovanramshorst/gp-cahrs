import {Generation} from "./generation.ts";
import { red } from "./deps.ts";
import {NodeConfig} from "./nodes/node.ts";

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

    private performanceTest: NodeConfig<any> | null = null

    private recentStatus = ""

    private progress: number | null = null
    private maxProgress: number | null = null
    private deltaProgress: number = 1

    public setActive(generation: Generation | null) {
        this.generation = generation
    }

    public setProgress(progress: number, maxProgress: number) {
        if (maxProgress != this.maxProgress && maxProgress > LOADING_BAR_LENGTH) {
            this.deltaProgress = Math.floor(maxProgress / LOADING_BAR_LENGTH)
        }
        if (progress % this.deltaProgress === 0) {
            this.progress = progress
            this.maxProgress = maxProgress
            this.updated()
        }
    }

    public setPerformanceTest(config: NodeConfig<any> | null) {
        this.performanceTest = config
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
            this.renderPerformanceTesting()
        }

        console.log("Output:")
        console.log(this.recentStatus)
        this.renderProgress()
    }

    private renderPerformanceTesting() {
        this.clear()
        console.log("Testing performance of: ")
        console.log(`${this.performanceTest?.print(0) ?? ""}`)
    }

    private renderGeneration() {
        this.clear()

        this.generation?.print()
    }

    private clear() {
        console.log("!clear!")
        console.clear()
        this.renderHeader()
    }

    private renderProgress() {
        if (this.progress && this.maxProgress) {
            const loadingBars = Math.floor((this.progress * LOADING_BAR_LENGTH) / this.maxProgress)
            const bar = [...Array(LOADING_BAR_LENGTH).keys()].map(i => i < loadingBars ? "-" : " ").join("")
            console.log(`[${bar}] ${this.progress}/${this.maxProgress}`)
        }
    }

    private renderHeader() {
        console.log(red("   ____    _    _   _ ____  ____         ____ ____  "))
        console.log(red("  / ___|  / \\  | | | |  _ \\/ ___|       / ___|  _ \\ "))
        console.log(red(" | |     / _ \\ | |_| | |_) \\___ \\ _____| |  _| |_) |"))
        console.log(red(" | |___ / ___ \\|  _  |  _ < ___) |_____| |_| |  __/ "))
        console.log(red("  \\____/_/   \\_\\_| |_|_| \\_\\____/       \\____|_|    "))
        console.log("Created by Arjo van Ramshorst as Thesis Research Tool")
        console.log()
    }
}