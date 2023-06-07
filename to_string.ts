export function makeToString<E>(source: AsyncIterable<E>) {
  return async (): Promise<string> => {
    let string = "";
    for await (const element of source) {
      string += element;
    }
    return string;
  };
}
