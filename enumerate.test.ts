import { assertEquals } from "@std/assert";
import { makeEnumerate } from "./enumerate.ts";

Deno.test({
  name: "enumerate empty",
  fn() {
    function* source() {}
    const enumerate = makeEnumerate(source());
    const it = enumerate()[Symbol.iterator]();
    assertEquals(it.next(), { done: true, value: undefined });
  },
});

Deno.test({
  name: "enumerate some",
  async fn() {
    function* source(): Iterable<Promise<IteratorResult<string | boolean>>> {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "" });
    }
    const enumerate = makeEnumerate(source());
    const it = enumerate()[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: [0, false] });
    assertEquals(await it.next().value, { done: false, value: [1, ""] });
    assertEquals(it.next(), { done: true, value: undefined });
  },
});

Deno.test({
  name: "enumerate some with offset and step",
  async fn() {
    function* source(): Iterable<
      Promise<IteratorResult<string | boolean | number>>
    > {
      yield Promise.resolve({ done: false, value: false });
      yield Promise.resolve({ done: false, value: "" });
      yield Promise.resolve({ done: false, value: 0 });
    }
    const enumerate = makeEnumerate(source());
    const it = enumerate(-4, 7)[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: [-4, false] });
    assertEquals(await it.next().value, { done: false, value: [3, ""] });
    assertEquals(await it.next().value, { done: false, value: [10, 0] });
    assertEquals(it.next(), { done: true, value: undefined });
  },
});
