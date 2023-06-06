export function makeHead<E>(source: AsyncIterable<E>) {
  return async (): Promise<E | undefined> => {
    const itr = source[Symbol.asyncIterator]();
    const element = await itr.next();
    return element.done ? undefined : element.value;
  };
}
