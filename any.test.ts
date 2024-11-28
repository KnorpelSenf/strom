import { makeAny } from "./any.ts";
import { assert, assertFalse } from "@std/assert";

Deno.test({
  name: "any on empty",
  async fn() {
    function* source() {}
    const any = makeAny(source());
    assertFalse(await any());
  },
});

Deno.test({
  name: "any on none",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "" });
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: false });
    }
    const any = makeAny(source());
    assertFalse(await any());
  },
});

Deno.test({
  name: "any on some",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "x" });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: false });
    }
    const any = makeAny(source());
    assert(await any());
  },
});

Deno.test({
  name: "any on every",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: true });
      yield Promise.resolve({ done: false, value: "x" });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: true });
    }
    const any = makeAny(source());
    assert(await any());
  },
});
