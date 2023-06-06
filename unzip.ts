interface Link<E> {
  result: IteratorResult<E>;
  next: Link<E> | null;
}
export function makeUnzip<E>(source: AsyncIterable<E>) {
  return <T, U>(): [AsyncIterable<T>, AsyncIterable<U>] => {
    const itr = source[Symbol.asyncIterator]();
    let op: ReturnType<typeof fetchNext> | undefined;
    async function fetchNext() {
      const { done, value } = await itr.next();
      const [left, right] = value;
      const result: [IteratorResult<T>, IteratorResult<U>] = done
        ? [{ done: true, value: undefined }, { done: true, value: undefined }]
        : [{ value: left }, { value: right }];
      op = undefined;
      return result;
    }

    let headL: Link<T> | null = null;
    let tailL: Link<T> | null = null;
    let headR: Link<U> | null = null;
    let tailR: Link<U> | null = null;
    async function push() {
      while (op !== undefined) await op;
      op = fetchNext();
      const [resultL, resultR] = await op;

      const linkL: Link<T> = { result: resultL, next: null };
      if (tailL === null) headL = tailL = linkL;
      else tailL.next = linkL;

      const linkR: Link<U> = { result: resultR, next: null };
      if (tailR === null) headR = tailR = linkR;
      else tailR.next = linkR;
    }
    async function pullLeft(): Promise<IteratorResult<T>> {
      if (headL === null) await push();
      const remove = headL!;
      if (headL === tailL) headL = tailL = null;
      else headL = remove.next;
      return remove.result;
    }
    async function pullRight(): Promise<IteratorResult<U>> {
      if (headR === null) await push();
      const remove = headR!;
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
