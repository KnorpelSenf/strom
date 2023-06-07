import { readableStreamFromIterable } from "./deps/std.ts";

export function makeEncode(source: AsyncIterable<string>) {
  return (): AsyncIterable<Uint8Array> => {
    async function* encode() {
      yield* readableStreamFromIterable(source)
        .pipeThrough(new TextEncoderStream());
    }
    return encode();
  };
}
