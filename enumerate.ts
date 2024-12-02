export function makeEnumerate<T>(source: Iterable<Promise<IteratorResult<T>>>) {
  return (offset = 0, step = 1) => {
    function* enumerate() {
      let index = offset;
      for (const elem of source) {
        const i = index;
        yield elem.then((e): IteratorResult<[number, T]> =>
          e.done ? e : { done: false, value: [i, e.value] }
        );
        index += step;
      }
    }
    return enumerate();
  };
}
