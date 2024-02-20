export function makeToArray<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (buffer?: E[]): Promise<E[]> => {
    if (buffer === undefined) {
      const array: E[] = [];
      for await (const element of source) {
        if (element.done) break;
        array.push(element.value);
      }
      return array;
    }
    const itr = source[Symbol.iterator]();
    const len = buffer.length;
    const tasks = Array<IteratorResult<Promise<IteratorResult<E>>>>(len);
    for (let i = 0; i < len; i++) tasks[i] = itr.next();
    for (let i = 0; i < len; i++) {
      const task = tasks[i];
      if (task.done) break;
      const result = await task.value;
      if (result.done) break;
      buffer[i] = result.value;
    }
    return buffer;
  };
}
