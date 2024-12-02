import { fromItr, toItr } from "./util.ts";

function encode(itr: AsyncIterable<string>): AsyncIterable<Uint8Array> {
  return ReadableStream.from(itr)
    .pipeThrough(new TextEncoderStream());
}

export function makeEncode(
  source: Iterable<Promise<IteratorResult<string>>>,
) {
  return () => fromItr(encode(toItr(source)));
}
