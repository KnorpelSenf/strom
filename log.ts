export function makeLog<E>(source: AsyncIterable<E>) {
  return (
    log: (element: E, index: number) => string | string[] = (e) =>
      Deno.inspect(e),
  ): AsyncIterable<E> => {
    async function* loop() {
      let index = 0;
      for await (const element of source) {
        const message = log(element, index++);
        if (typeof message === "string") console.log(message);
        else console.log(...message);
        yield element;
      }
    }
    return loop();
  };
}
