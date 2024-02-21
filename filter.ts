import { dequeue, empty, enqueue, isEmpty } from "./deps/queue.ts";
import { type Deferred, deferred } from "./deps/std.ts";

type Option<E> = { ok: false } | { ok: true; some: E };

export function makeFilter<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    predicate: (element: E, index: number) => boolean | Promise<boolean> = (
      e,
    ) => e != null,
  ): Iterable<Promise<IteratorResult<E>>> => {
    return {
      [Symbol.iterator]() {
        const it = source[Symbol.iterator]();
        let index = 0;
        const values = empty<Promise<IteratorResult<Option<E>>>>();
        const consumers = empty<Deferred<void>>();
        return {
          next() {
            const i = index++;
            // eagerly fetch and test the next element, enqueue it
            const res = it.next();
            if (res.done) return res;

            async function test(val: IteratorResult<E>) {
              if (val.done) return val;
              const okValue: Option<E> = await predicate(val.value, i)
                ? { ok: true, some: val.value }
                : { ok: false };
              return { done: false, value: okValue };
            }

            enqueue(values, res.value.then(test));
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
                if (val.done) return val;
                if (val.value.ok) {
                  return { done: false, value: val.value.some };
                }
                // skip element, eagerly fetch next, loop around
                const res = it.next();
                if (!res.done) enqueue(values, res.value.then(test));
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
