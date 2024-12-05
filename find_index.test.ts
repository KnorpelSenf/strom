import { assertEquals } from "@std/assert";
import { makeFindIndex } from "./find_index.ts";

Deno.test({
  name: "findIndex on empty",
  async fn() {
    function* source() {}
    const findIndex = makeFindIndex(source());
    assertEquals(await findIndex(), -1);
  },
});

Deno.test({
  name: "findIndex on some",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: null });
      yield Promise.resolve({ done: false, value: "" });
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: undefined });
    }
    const findIndex = makeFindIndex(source());
    assertEquals(await findIndex(), 1);
  },
});

Deno.test({
  name: "findIndex on some with callback",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<unknown>>> {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "" });
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: false });
    }
    const findIndex = makeFindIndex(source());
    assertEquals(await findIndex((elem) => elem === 0), 2);
  },
});
