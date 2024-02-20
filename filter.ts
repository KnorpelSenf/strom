import { dequeue, empty, enqueue, isEmpty } from "./deps/queue.ts";
import { type Deferred, deferred } from "./deps/std.ts";

export function makeFilter<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    predicate: (element: E) => boolean | Promise<boolean> = (e) => e != null,
  ): Iterable<Promise<IteratorResult<E>>> => {
    return {
      [Symbol.iterator]() {
        const it = source[Symbol.iterator]();
        const values = empty<Promise<IteratorResult<E>>>();
        const consumers = empty<Deferred<void>>();
        return {
          next() {
            // eagerly fetch the next element, enqueue it
            const res = it.next();
            if (res.done) return { done: true, value: undefined };
            enqueue(values, res.value);
            // concurrently wait for it to arrive unless we are first
            const resume = deferred();
            if (isEmpty(consumers)) resume.resolve();
            else enqueue(consumers, resume);
            // return a promise of the next accepted element
            async function pull(): Promise<IteratorResult<E>> {
              await resume;
              while (!isEmpty(values)) {
                // dequeue, test, return
                const val = await dequeue(values);
                if (val.done) return { done: true, value: undefined };
                if (await predicate(val.value)) return val;
                // skip element, eagerly fetch next, loop around
                const res = it.next();
                if (!res.done) enqueue(values, res.value);
              }
              return { done: true, value: undefined };
            }
            return {
              done: false,
              value: pull().finally(() => {
                // notify next consumer once we're done
                if (!isEmpty(consumers)) {
                  dequeue(consumers).resolve();
                }
              }),
            };
          },
        };
      },
    };
  };
}
