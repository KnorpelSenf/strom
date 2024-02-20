export function makeLast<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (): Promise<E | undefined> => {
    let last: E | undefined;
    for await (const element of source) last = element;
    return last;
  };
}
