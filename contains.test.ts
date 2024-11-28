import { assert, assertFalse } from "@std/assert";
import { makeContains } from "./contains.ts";

Deno.test({
  name: "contains on empty",
  async fn() {
    function* source() {}
    const contains = makeContains(source());
    assertFalse(await contains(0));
  },
});

Deno.test({
  name: "contains on none",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: "0" });
      yield Promise.resolve({ done: false, value: 2 });
    }
    const contains = makeContains(source());
    assertFalse(await contains(0));
  },
});

Deno.test({
  name: "contains on some",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: "0" });
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: 2 });
    }
    const contains = makeContains(source());
    assert(await contains(0));
  },
});
