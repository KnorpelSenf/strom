export function makeMin<E>(source: AsyncIterable<E>) {
  return async (
    compare?: (l: E, r: E) => number | Promise<number>,
  ): Promise<E> => {
    const itr = source[Symbol.asyncIterator]();
    let result = await itr.next();
    if (result.done) return Infinity as E;
    let min = result.value;
    const isSmaller: (other: E) => boolean | Promise<boolean> =
      compare === undefined
        ? (other) =>
          typeof min === "string" && typeof other === "string"
            ? 0 > min.localeCompare(other)
            : min > other
        : async (other) => 0 > await compare(min, other);
    while (!(result = await itr.next()).done) {
      if (await isSmaller(result.value)) {
        min = result.value;
      }
    }
    return min;
  };
}
