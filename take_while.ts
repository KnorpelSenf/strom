import { dequeue, empty, enqueue, isEmpty, peek } from "./deps/queue.ts";
import { type Deferred, deferred } from "./deps/std.ts";

interface TakeResult<T> {
  consumer: Deferred<void>;
  result: Promise<IteratorResult<T>>;
}

export function makeTakeWhile<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    predicate: (element: E, index: number) => boolean | Promise<boolean> = (
      e,
    ) => e != null,
  ): Iterable<Promise<IteratorResult<E>>> => {
    return {
      [Symbol.iterator]() {
        const it = source[Symbol.iterator]();
        let index = 0;
        let active = true;
        const values = empty<TakeResult<E>>();
        return {
          next() {
            const i = index++;
            if (!active) return { done: true, value: undefined };
            const res = it.next();
            if (res.done) return res;
            const val = res.value;

            async function testVal(): Promise<IteratorResult<E>> {
              const v = await val;
              if (v.done) return v;
              if (await predicate(v.value, i)) return v;
              return { done: true, value: undefined };
            }

            const resume = deferred<void>();
            if (isEmpty(values)) resume.resolve();
            enqueue(values, { consumer: resume, result: testVal() });

            async function pull(): Promise<IteratorResult<E>> {
              await resume;
              const takeResult = await dequeue(values).result;
              if (!active) return { done: true, value: undefined };
              if (takeResult.done) active = false;
              return takeResult;
            }

            return {
              done: false,
              value: pull().finally(() => peek(values)?.consumer.resolve()),
            };
          },
        };
      },
    };
  };
}
