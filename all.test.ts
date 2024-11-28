import { makeAll } from "./all.ts";
import { assert, assertFalse } from "@std/assert";

Deno.test({
  name: "all on empty",
  async fn() {
    function* source() {}
    const all = makeAll(source());
    assert(await all());
  },
});

Deno.test({
  name: "all on none",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "" });
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: false });
    }
    const all = makeAll(source());
    assertFalse(await all());
  },
});

Deno.test({
  name: "all on some",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "x" });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: false });
    }
    const all = makeAll(source());
    assertFalse(await all());
  },
});

Deno.test({
  name: "all on every",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: true });
      yield Promise.resolve({ done: false, value: "x" });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: true });
    }
    const all = makeAll(source());
    assert(await all());
  },
});
