interface Link<E> {
  result: Promise<IteratorResult<E>>;
  next: Link<E> | null;
  index: number;
}
export function makeSplitAt<E>(source: AsyncIterable<E>) {
  return (splitIndex: number): [AsyncIterable<E>, AsyncIterable<E>] => {
    const itr = source[Symbol.asyncIterator]();
    let index = 0;
    let leftComplete = false;
    function fetchNext() {
      if (index < splitIndex) index++;
      else leftComplete = true;
      return itr.next();
    }

    let head: Link<E> | null = null;
    let tail: Link<E> | null = null;
    function push() {
      const result = fetchNext();
      const link: Link<E> = { result, next: null, index: index };
      if (tail === null) head = tail = link;
      else tail.next = link;
    }
    function pullLeft(): Promise<IteratorResult<E>> {
      if (leftComplete) {
        return Promise.resolve({ done: true, value: undefined });
      }
      if (head === null) return fetchNext();
      const element = head.result;
      if (head === tail) head = tail = null;
      else head = head.next;
      return element;
    }
    function pullRight(): Promise<IteratorResult<E>> {
      while (!leftComplete) push();
      return fetchNext();
    }

    return [
      { [Symbol.asyncIterator]: () => ({ next: pullLeft }) },
      { [Symbol.asyncIterator]: () => ({ next: pullRight }) },
    ];
  };
}
