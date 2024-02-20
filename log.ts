export function makeLog<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    log: (element: E, index: number) => string | string[] = (e) =>
      Deno.inspect(e),
  ): Iterable<Promise<IteratorResult<E>>> => {
    return {
      [Symbol.iterator]() {
        const it = source[Symbol.iterator]();
        let index = 0;
        return {
          next() {
            const i = index++;
            const res = it.next();
            if (res.done) return res;
            return {
              done: false,
              value: res.value.then((v) => {
                // log things in the order they are processed,
                // not the order in the stream
                if (v.done) return v;
                const message = log(v.value, i);
                if (typeof message === "string") console.log(message);
                else console.log(...message);
                return v;
              }),
            };
          },
        };
      },
    };
  };
}
