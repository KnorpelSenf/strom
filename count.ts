export function makeCount<E>(source: AsyncIterable<E>) {
  return async (): Promise<number> => {
    let count = 0;
    for await (const _ of source) count++;
    return count;
  };
}
