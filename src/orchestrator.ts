const testMultiThread = () => {
  const worker = new Worker(
    new URL("./memory-worker.ts", import.meta.url).href,
    {
      type: "module",
    },
  );
  worker.postMessage({});
}

testMultiThread()
testMultiThread()
testMultiThread()
testMultiThread()
