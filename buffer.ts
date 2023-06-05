import { type Deferred, deferred } from "./deps/std.ts";

export function makeBuffer<E>(source: AsyncIterable<E>) {
  return (size = 1): AsyncIterable<E> => {
    let complete = false;
    let count = 0;
    let write = 0;
    let read = 0;
    let content: Deferred<void> | undefined;
    let space: Deferred<void> | undefined;
    const buffer = Array<Promise<IteratorResult<E>> | undefined>(size);

    async function push() {
      const itr = source[Symbol.asyncIterator]();
      while (!complete) {
        if (count === size) await (space = deferred());
        buffer[write] = itr.next();
        write = (write + 1) % size;
        count++;
        content?.resolve();
      }
    }

    async function* pull() {
      while (!complete) {
        if (count === 0) await (content = deferred());
        const element = buffer[read]!;
        buffer[read] = undefined;
        read = (read + 1) % size;
        count--;
        space?.resolve();
        const { done, value } = await element;
        if (done) complete = true;
        else yield value;
      }
    }

    push();
    return pull();
  };
}
