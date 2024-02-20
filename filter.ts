import { type Deferred, deferred } from "./deps/std.ts";

type Link<T> = null | { elem: T; link: Link<T> };
interface List<T> {
  head: Link<T>;
  tail: Link<T>;
}
function empty<T>(): List<T> {
  return { head: null, tail: null };
}
function enqueue<T>(list: List<T>, elem: T) {
  const link: Link<T> = { elem, link: null };
  if (list.tail === null) list.head = link;
  else list.tail.link = link;
  list.tail = link;
}
function dequeue<T>(list: List<T>): T {
  if (list.head === null) throw new Error("dequeue empty list");
  const link = list.head;
  list.head = link.link;
  return link.elem;
}
function isEmpty<T>(list: List<T>): boolean {
  return list.head === null;
}

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
            if (!res.done) enqueue(values, res.value);
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
