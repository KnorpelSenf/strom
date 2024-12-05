import { assertEquals } from "@std/assert";
import { makeFind } from "./find.ts";

Deno.test({
  name: "find on empty",
  async fn() {
    function* source() {}
    const find = makeFind(source());
    assertEquals(await find(), undefined);
  },
});

Deno.test({
  name: "find on some",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: null });
      yield Promise.resolve({ done: false, value: "" });
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: undefined });
    }
    const find = makeFind(source());
    assertEquals(await find(), "");
  },
});

Deno.test({
  name: "find on some with callback",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "x" });
      yield Promise.resolve({ done: false, value: "" });
    }
    const find = makeFind(source());
    assertEquals(await find((elem) => typeof elem === "string"), "x");
  },
});
