function unpack(
  source: Iterable<Promise<IteratorResult<Uint8Array>>>,
): AsyncIterable<Uint8Array> {
  return {
    [Symbol.asyncIterator]() {
      return {
        next() {
          const it = source[Symbol.iterator]();
          const elem = it.next();
          return elem.done ? Promise.resolve(elem) : elem.value;
        },
      };
    },
  };
}
function decode(itr: AsyncIterable<Uint8Array>): AsyncIterable<string> {
  // TODO: perf: can we buffer more eagerly?
  return ReadableStream.from(itr).pipeThrough(new TextDecoderStream());
}
function pack(
  stream: AsyncIterable<string>,
): Iterable<Promise<IteratorResult<string>>> {
  return {
    [Symbol.iterator]() {
      const it = stream[Symbol.asyncIterator]();
      async function nextPromise() {
        const res = await it.next();
        if (res.done) return res;
        else return { done: false, value: res.value };
      }
      return {
        next(): IteratorResult<Promise<IteratorResult<string>>> {
          return { done: false, value: nextPromise() };
        },
      };
    },
  };
}

export function makeDecode(
  source: Iterable<Promise<IteratorResult<Uint8Array>>>,
) {
  return () => pack(decode(unpack(source)));
}
