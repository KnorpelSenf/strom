import { type Deferred, deferred } from "./deps/std.ts";

export function makeParallel<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (size = 1024): Iterable<Promise<IteratorResult<E>>> => {
    return {
      [Symbol.iterator](): Iterator<Promise<IteratorResult<E>>> {
        let count = 0;
        let write = 0;
        let read = 0;
        let space: Deferred<void> | undefined;
        let content: Deferred<void> | undefined;
        const buffer = Array<Promise<IteratorResult<E>> | undefined>(size);

        async function pushAll() {
          const it = source[Symbol.iterator]();
          let complete = false;
          while (!complete) {
            if (count === size) await (space = deferred());
            const res = it.next();
            if (res.done) break;
            res.value.then((v) => {
              if (v.done) complete = true;
            });
            buffer[write] = res.value;
            write = (write + 1) % size;
            count++;
            if (content !== undefined) {
              content.resolve();
              content = undefined;
            }
          }
        }

        async function pull() {
          if (count === 0) await (content = deferred());
          const res = buffer[read]!;
          buffer[read] = undefined;
          read = (read + 1) % size;
          count--;
          if (space !== undefined) {
            space.resolve();
            space = undefined;
          }
          return res;
        }

        pushAll();
        return {
          next(): IteratorResult<Promise<IteratorResult<E>>> {
            return { done: false, value: pull() };
          },
        };
      },
    };
  };
}
