import { fromItr, toItr } from "./util.ts";

function decode(itr: AsyncIterable<Uint8Array>): AsyncIterable<string> {
  return ReadableStream.from(itr)
    .pipeThrough(new TextDecoderStream());
}

export function makeDecode(
  source: Iterable<Promise<IteratorResult<Uint8Array>>>,
) {
  return () => fromItr(decode(toItr(source)));
}
