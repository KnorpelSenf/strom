export function makeSplit<E>(source: AsyncIterable<string>) {
  return (on: string | RegExp): AsyncIterable<string> => {
    async function* split() {
      const itr = source[Symbol.asyncIterator]();
      let last: string | undefined;
      let result: IteratorResult<string>;
      while (!(result = await itr.next()).done) {
        const parts = result.value.split(on);
        if (last !== undefined) parts[0] = last + parts[0];
        const lastIndex = parts.length - 1;
        for (let i = 0; i < lastIndex; i++) {
          yield parts[i];
        }
        last = parts[lastIndex];
      }
      if (last !== undefined) {
        yield last;
      }
    }
    return split();
  };
}
