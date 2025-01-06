import { assertEquals } from "@std/assert";
import { makeHead } from "./head.ts";

Deno.test({
  name: "head on empty",
  async fn() {
    function* source() {}
    const head = makeHead(source());
    assertEquals(await head(), undefined);
  },
});

Deno.test({
  name: "head on some",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "" });
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: false });
    }
    const head = makeHead(source());
    assertEquals(await head(), false);
  },
});
