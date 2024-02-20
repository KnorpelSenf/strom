interface Link<E> {
  result: IteratorResult<E>;
  next: Link<E> | null;
}
export function makeSpan<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    predicate: (element: E, index: number) => boolean | Promise<boolean>,
  ): [
    Iterable<Promise<IteratorResult<E>>>,
    Iterable<Promise<IteratorResult<E>>>,
  ] => {
    const itr = source[Symbol.asyncIterator]();
    let index = 0;
    let leftComplete = false;
    let op: ReturnType<typeof fetchNext> | undefined;
    async function fetchNext() {
      const result = await itr.next();
      leftComplete ||= !result.done && !await predicate(result.value, index++);
      op = undefined;
      return result;
    }

    let head: Link<E> | null = null;
    let tail: Link<E> | null = null;
    let headR: IteratorResult<E> | null = null;
    async function push() {
      if (op !== undefined) {
        await op;
        return;
      }
      op = fetchNext();
      const result = await op;
      if (leftComplete) {
        headR = result;
        return;
      }
      const link: Link<E> = { result, next: null };
      if (tail === null) head = tail = link;
      else tail.next = link;
    }
    async function pullLeft(): Promise<IteratorResult<E>> {
      if (leftComplete) return { done: true, value: undefined };
      if (head === null) await push();
      if (leftComplete) return { done: true, value: undefined };
      const remove = head!;
      if (head === tail) head = tail = null;
      else head = remove.next;
      return remove.result;
    }
    async function pullRight(): Promise<IteratorResult<E>> {
      while (headR === null) await push();
      const remove = headR;
      headR = null;
      return remove;
    }

    return [
      { [Symbol.asyncIterator]: () => ({ next: pullLeft }) },
      { [Symbol.asyncIterator]: () => ({ next: pullRight }) },
    ];
  };
}
