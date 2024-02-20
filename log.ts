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
            if (res.done) return { done: true, value: undefined };

            const val = res.value;

            async function pullAndLog(): Promise<IteratorResult<E>> {
              const v = await val;
              if (v.done) return { done: true, value: undefined };
              const message = log(v.value, i);
              if (typeof message === "string") console.log(message);
              else console.log(...message);
              return v;
            }

            return { done: false, value: pullAndLog() };
          },
        };
      },
    };
  };
}
