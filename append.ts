import { dequeue, empty, enqueue } from "./util.ts";

export function chain<E>(
  init: Iterable<Promise<IteratorResult<E>>>,
  tail: Iterable<Promise<IteratorResult<E>>>,
): Iterable<Promise<IteratorResult<E>>> {
  return {
    [Symbol.iterator]() {
      const first = init[Symbol.iterator]();
      const second = tail[Symbol.iterator]();

      let requested = 0;
      const buffer = empty<IteratorResult<Promise<IteratorResult<E>>>>();
      let useSecond = false;
      let complete = false;

      async function nextElement(): Promise<IteratorResult<E>> {
        if (useSecond) {
          const elem = buffer.size === 0 ? second.next() : dequeue(buffer);
          if (elem.done) return elem;
          elem.value.then((res) => res.done && (complete = true));
          return elem.value;
        }
        const elem = first.next();
        requested++;
        if (requested > buffer.size) {
          enqueue(buffer, second.next());
        }
        if (elem.done) {
          useSecond = true;
          return await nextElement();
        }
        const val = await elem.value;
        if (val.done) {
          useSecond = true;
          return await nextElement();
        }
        requested--;
        return val;
      }

      return {
        next() {
          return complete
            ? { done: true, value: undefined }
            : { done: false, value: nextElement() };
        },
      };
    },
  };
}

export function makeAppend<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    ...others: Iterable<Promise<IteratorResult<E>>>[]
  ): Iterable<Promise<IteratorResult<E>>> => {
    return others.reduce(chain, source);
  };
}
