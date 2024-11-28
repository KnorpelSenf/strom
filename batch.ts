export function makeBatch<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (count: number): Iterable<Promise<IteratorResult<E[]>>> => {
    return {
      [Symbol.iterator]() {
        const itr = source[Symbol.iterator]();
        let complete = false;

        async function nextBatch(): Promise<IteratorResult<E[]>> {
          if (complete) return { done: true, value: undefined };
          // Synchronously iterate the source
          const promises = Array<Promise<IteratorResult<E>>>(count);
          let batchSize = 0;
          for (batchSize = 0; batchSize < count; batchSize++) {
            const res = itr.next();
            if (res.done) {
              promises.length = batchSize;
              complete = true;
              break;
            }
            promises[batchSize] = res.value;
          }
          if (batchSize === 0) return { done: true, value: undefined };
          // Asynchronously collect the promises to a batch
          const results = await Promise.allSettled(promises);
          const batch = Array<E>(batchSize);
          for (let i = 0; i < batchSize; i++) {
            const result = results[i];
            if (result.status === "rejected") {
              const cause = results.filter((res) => res.status === "rejected")
                .map((res) => res.reason);
              throw new Error(
                "strom source rejected with errors during batching",
                { cause },
              );
            }
            const res = result.value;
            if (res.done) {
              complete = true;
              if (i === 0) return { done: true, value: undefined };
              batch.length = i;
              return { done: false, value: batch };
            }
            batch[i] = res.value;
          }
          return { done: false, value: batch };
        }

        return {
          next() {
            return complete
              ? { done: true, value: undefined }
              : { done: false, value: nextBatch() };
          },
        };
      },
    };
  };
}
