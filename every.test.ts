import { assert, assertFalse } from "@std/assert";
import { makeEvery } from "./every.ts";

Deno.test({
  name: "every on empty",
  async fn() {
    function* source() {}
    const every = makeEvery(source());
    assert(await every());
  },
});

Deno.test({
  name: "every on empty with callback",
  async fn() {
    function* source() {}
    const every = makeEvery(source());
    assert(await every((elem) => elem !== undefined));
  },
});

Deno.test({
  name: "every on none",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: null });
      yield Promise.resolve({ done: false, value: undefined });
      yield Promise.resolve({ done: false, value: undefined });
      yield Promise.resolve({ done: false, value: null });
    }
    const every = makeEvery(source());
    assertFalse(await every());
  },
});

Deno.test({
  name: "every on none with callback",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "" });
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: false });
    }
    const every = makeEvery(source());
    assertFalse(await every((elem) => Promise.resolve(!!elem)));
  },
});

Deno.test({
  name: "every on some",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: null });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: undefined });
      yield Promise.resolve({ done: false, value: false });
    }
    const every = makeEvery(source());
    assertFalse(await every());
  },
});

Deno.test({
  name: "every on some with callback",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: null });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: undefined });
      yield Promise.resolve({ done: false, value: false });
    }
    const every = makeEvery(source());
    assertFalse(await every((elem) => Promise.resolve(elem == null)));
  },
});

Deno.test({
  name: "every on every",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: true });
      yield Promise.resolve({ done: false, value: "x" });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: true });
    }
    const every = makeEvery(source());
    assert(await every());
  },
});

Deno.test({
  name: "every on every with callback",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: true });
      yield Promise.resolve({ done: false, value: "x" });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: true });
    }
    const every = makeEvery(source());
    assert(await every((elem) => Promise.resolve(!!elem)));
  },
});
