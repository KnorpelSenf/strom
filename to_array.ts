export function makeToArray<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (buffer?: E[]): Promise<E[]> => {
    if (buffer === undefined) {
      // create buffer and push to it
      const array: E[] = [];
      for await (const element of source) {
        if (element.done) break;
        array.push(element.value);
      }
      return array;
    }

    // fill existing buffer
    const itr = source[Symbol.iterator]();
    const len = buffer.length;
    for (let i = 0; i < len; i++) {
      const task = itr.next();
      if (task.done) break;
      const result = await task.value;
      if (result.done) break;
      buffer[i] = result.value;
    }
    return buffer;
  };
}
