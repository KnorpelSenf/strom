export function makeLog<E>(source: AsyncIterable<E>) {
  return (
    log: (element: E) => string | string[] = Deno.inspect,
  ): AsyncIterable<E> => {
    async function* loop() {
      for await (const element of source) {
        const message = log(element);
        if (typeof message === "string") console.log(message);
        else console.log(...message);
        yield element;
      }
    }
    return loop();
  };
}
