import { makeDrop } from "./drop.ts";
import { assertEquals } from "@std/assert";

Deno.test({
  name: "drop on empty",
  fn() {
    function* source() {}
    const drop = makeDrop(source());
    const it = drop(2)[Symbol.iterator]();
    assertEquals(it.next(), { done: true, value: undefined });
  },
});

Deno.test({
  name: "drop on some",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "" });
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: false });
    }
    const drop = makeDrop(source());
    const it = drop(2)[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: 0 });
    assertEquals(await it.next().value, { done: false, value: false });
    assertEquals(it.next(), { done: true, value: undefined });
  },
});
