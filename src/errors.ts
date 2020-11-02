export class ProcessTreeNotInitializedError extends Error {
    constructor() {
        super("ProcessTree is not initialized");
        // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = ProcessTreeNotInitializedError.name; // stack traces display correctly now
    }
}