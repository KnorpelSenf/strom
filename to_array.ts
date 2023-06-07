export function makeToArray<E>(source: AsyncIterable<E>) {
  return async (buffer?: E[]): Promise<E[]> => {
    if (buffer === undefined) {
      const array: E[] = [];
      for await (const element of source) array.push(element);
      return array;
    }
    const itr = source[Symbol.asyncIterator]();
    const len = buffer.length;
    const tasks = Array<Promise<IteratorResult<E>>>(len);
    for (let i = 0; i < len; i++) tasks[i] = itr.next();
    for (let i = 0; i < len; i++) {
      const result = await tasks[i];
      if (result.done) break;
      buffer[i] = result.value;
    }
    return buffer;
  };
}
