export function makeMax<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (
    compare?: (l: E, r: E) => number | Promise<number>,
  ): Promise<E> => {
    const itr = source[Symbol.asyncIterator]();
    let result = await itr.next();
    if (result.done) return -Infinity as E;
    let max = result.value;
    const isGreater: (other: E) => boolean | Promise<boolean> =
      compare === undefined
        ? (other) =>
          typeof max === "string" && typeof other === "string"
            ? 0 < max.localeCompare(other)
            : max < other
        : async (other) => 0 < await compare(max, other);
    while (!(result = await itr.next()).done) {
      if (await isGreater(result.value)) {
        max = result.value;
      }
    }
    return max;
  };
}
