export function makeToString<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (): Promise<string> => {
    let string = "";
    for await (const element of source) {
      string += String(element);
    }
    return string;
  };
}
