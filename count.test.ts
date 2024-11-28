import { makeCount } from "./count.ts";
import { assertEquals } from "@std/assert";

Deno.test({
  name: "count on empty",
  async fn() {
    function* source() {}
    const count = makeCount(source());
    assertEquals(await count(), 0);
  },
});

Deno.test({
  name: "count on some",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "" });
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: false });
    }
    const count = makeCount(source());
    assertEquals(await count(), 4);
  },
});
