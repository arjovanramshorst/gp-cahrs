import { WorkerRequest, WorkerResponse } from "./worker.ts";

export class WorkerPool {
  constructor(
    private readonly size: number,
    private taskQueue: WorkerTask[] = [],
    private workerQueue: WorkerThread[] = [],
  ) {}

  init = () => {
    for (let i = 0; i < this.size; i++) {
      this.workerQueue.push(new WorkerThread(this, i));
    }
  };

  addWorkerTask = (
    workerRequest: Omit<WorkerRequest, "worker">,
  ): Promise<WorkerResponse> => {
    return new Promise((resolve) => {
      const workerTask = {
        callback: resolve,
        startMessage: workerRequest,
      };

      if (this.workerQueue.length > 0) {
        // get the worker from the front of the queue
        const workerThread = this.workerQueue.shift() as WorkerThread;
        workerThread.run(workerTask);
      } else {
        // no free workers,
        this.taskQueue.push(workerTask);
      }
    });
  };

  freeWorkerThread = (workerThread: WorkerThread) => {
    if (this.taskQueue.length > 0) {
      // don't put back in queue, but execute next task
      const workerTask = this.taskQueue.shift() as WorkerTask;

      workerThread.run(workerTask);
    } else {
      // Add back to queue
      this.workerQueue.push(workerThread);
    }
  };
}

export class WorkerThread {
  constructor(
    private readonly parentPool: WorkerPool,
    private readonly workerId: number,
    private workerTask: WorkerTask | null = null,
  ) {}

  run = (workerTask: WorkerTask) => {
    this.workerTask = workerTask;
    // create a new web worker
    if (this.workerTask) {
      const worker = new Worker(
        new URL("./worker.ts", import.meta.url).href,
        {
          type: "module",
          deno: {
            namespace: true,
          },
        },
      );
      worker.postMessage({
        ...workerTask.startMessage,
        worker: this.workerId,
      });
      worker.onmessage = this.dummyCallback;
    }
  };

  // for now assume we only get a single callback from a worker
  // which also indicates the end of this worker.
  dummyCallback = ({ data }: { data: WorkerResponse }) => {
    // pass to original callback
    if (this.workerTask) {
      this.workerTask.callback(data);
    } else {
      throw Error("Should never happen");
    }

    // we should use a seperate thread to add the worker
    this.parentPool.freeWorkerThread(this);
  };
}

interface WorkerTask {
  callback: (res: WorkerResponse) => void;
  startMessage: Omit<WorkerRequest, "worker">;
}
