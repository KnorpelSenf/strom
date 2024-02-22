import { dequeue, empty, enqueue, isEmpty, peek } from "./deps/queue.ts";
import { type Deferred, deferred } from "./deps/std.ts";

interface DropTestResult<E> {
  drop: boolean;
  val: E;
}

export function makeDropWhile<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    predicate: (element: E, index: number) => boolean | Promise<boolean> = (
      e,
    ) => e != null,
  ): Iterable<Promise<IteratorResult<E>>> => {
    return {
      [Symbol.iterator]() {
        const it = source[Symbol.iterator]();
        let index = 0;
        let dropping = true;
        const values = empty<Promise<IteratorResult<DropTestResult<E>>>>();
        const consumers = empty<Deferred<void>>();
        return {
          next() {
            const i = index++;
            const res = it.next();
            if (!dropping || res.done) return res;

            async function test(
              val: IteratorResult<E>,
            ): Promise<IteratorResult<DropTestResult<E>>> {
              if (val.done) return val;
              const okValue = {
                drop: await predicate(val.value, i),
                val: val.value,
              };
              return { done: false, value: okValue };
            }

            enqueue(values, res.value.then(test));
            // concurrently wait for it to arrive unless we are first
            const resume = deferred<void>();
            if (isEmpty(consumers)) resume.resolve();
            enqueue(consumers, resume);
            // return a promise of the next accepted element
            async function pull(): Promise<IteratorResult<E>> {
              await resume;
              while (!isEmpty(values)) {
                // dequeue, test, return
                const dropRes = await dequeue(values);
                if (dropRes.done) return dropRes;
                dropping &&= dropRes.value.drop;
                if (!dropping) return { done: false, value: dropRes.value.val };
                // drop element, eagerly fetch next, loop around
                const res = it.next();
                if (!res.done) enqueue(values, res.value.then(test));
              }
              return { done: true, value: undefined };
            }
            return {
              done: false,
              value: pull().finally(() => {
                // notify next consumer once we're done
                if (!isEmpty(consumers)) dequeue(consumers);
                peek(consumers)?.resolve();
              }),
            };
          },
        };
      },
    };
  };
}
