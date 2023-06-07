import { readableStreamFromIterable } from "./deps/std.ts";

export function makeDecode(source: AsyncIterable<Uint8Array>) {
  return (): AsyncIterable<string> => {
    async function* decode() {
      yield* readableStreamFromIterable(source)
        .pipeThrough(new TextDecoderStream());
    }
    return decode();
  };
}
