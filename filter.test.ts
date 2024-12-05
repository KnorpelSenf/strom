import { assertEquals } from "@std/assert";
import { makeFilter } from "./filter.ts";

Deno.test({
  name: "filter on empty",
  fn() {
    function* source() {}
    const filter = makeFilter(source());
    const it = filter()[Symbol.iterator]();
    assertEquals(it.next(), { done: true, value: undefined });
  },
});

Deno.test({
  name: "filter on const true",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: 2 });
    }
    const filter = makeFilter(source());
    const it = filter((e) => typeof e === "number")[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: 0 });
    assertEquals(await it.next().value, { done: false, value: 1 });
    assertEquals(await it.next().value, { done: false, value: 2 });
    assertEquals(it.next(), { done: true, value: undefined });
  },
});

Deno.test({
  name: "filter on const false",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: undefined });
      yield Promise.resolve({ done: false, value: null });
      yield Promise.resolve({ done: false, value: undefined });
    }
    const filter = makeFilter(source());
    const it = filter()[Symbol.iterator]();
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "filter on mixed",
  async fn() {
    function* source(): Iterable<
      Promise<IteratorResult<string | number | null | undefined>>
    > {
      yield Promise.resolve({ done: false, value: undefined });
      yield Promise.resolve({ done: false, value: null });
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: "" });
      yield Promise.resolve({ done: false, value: null });
      yield Promise.resolve({ done: false, value: "ABC" });
    }
    const filter = makeFilter(source());
    const it = filter()[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: 0 });
    assertEquals(await it.next().value, { done: false, value: "" });
    assertEquals(await it.next().value, { done: false, value: "ABC" });
    assertEquals(it.next(), { done: true, value: undefined });
  },
});
