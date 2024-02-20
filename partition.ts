interface Link<E> {
  result: IteratorResult<E>;
  next: Link<E> | null;
}
export function makePartition<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    predicate: (element: E, index: number) => boolean | Promise<boolean>,
  ): [
    Iterable<Promise<IteratorResult<E>>>,
    Iterable<Promise<IteratorResult<E>>>,
  ] => {
    const itr = source[Symbol.asyncIterator]();
    let index = 0;
    let op: ReturnType<typeof fetchNext> | undefined;
    async function fetchNext() {
      const result = await itr.next();
      const left = !result.done && await predicate(result.value, index++);
      op = undefined;
      return { result, left };
    }

    let headL: Link<E> | null = null;
    let tailL: Link<E> | null = null;
    let headR: Link<E> | null = null;
    let tailR: Link<E> | null = null;
    async function push() {
      if (op !== undefined) {
        const { result } = await op;
        return result.done;
      }
      op = fetchNext();
      const { result, left } = await op;
      const link: Link<E> = { result, next: null };
      if (left) {
        if (tailL === null) headL = tailL = link;
        else tailL.next = link;
      } else {
        if (tailR === null) headR = tailR = link;
        else tailR.next = link;
      }
      return result.done;
    }
    async function pullLeft(): Promise<IteratorResult<E>> {
      while (headL === null) {
        if (await push()) return { done: true, value: undefined };
      }
      const remove = headL;
      if (headL === tailL) headL = tailL = null;
      else headL = remove.next;
      return remove.result;
    }
    async function pullRight(): Promise<IteratorResult<E>> {
      while (headR === null) {
        if (await push()) return { done: true, value: undefined };
      }
      const remove = headR;
      if (headR === tailR) headR = tailR = null;
      else headR = remove.next;
      return remove.result;
    }

    return [
      { [Symbol.asyncIterator]: () => ({ next: pullLeft }) },
      { [Symbol.asyncIterator]: () => ({ next: pullRight }) },
    ];
  };
}
