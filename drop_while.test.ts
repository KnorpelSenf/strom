import { assertEquals } from "@std/assert";
import { makeDropWhile } from "./drop_while.ts";

Deno.test({
  name: "dropWhile on empty",
  fn() {
    function* source() {}
    const dropWhile = makeDropWhile(source());
    const it = dropWhile()[Symbol.iterator]();
    assertEquals(it.next(), { done: true, value: undefined });
  },
});

Deno.test({
  name: "dropWhile on const true",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: 2 });
    }
    const dropWhile = makeDropWhile(source());
    const it = dropWhile((e) => typeof e !== "number")[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: 0 });
    assertEquals(await it.next().value, { done: false, value: 1 });
    assertEquals(await it.next().value, { done: false, value: 2 });
    assertEquals(it.next(), { done: true, value: undefined });
  },
});

Deno.test({
  name: "dropWhile on const false",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: undefined });
      yield Promise.resolve({ done: false, value: null });
      yield Promise.resolve({ done: false, value: undefined });
    }
    const dropWhile = makeDropWhile(source());
    const it = dropWhile()[Symbol.iterator]();
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "dropWhile on mixed",
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
    const dropWhile = makeDropWhile(source());
    const it = dropWhile()[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: 0 });
    assertEquals(await it.next().value, { done: false, value: "" });
    assertEquals(await it.next().value, { done: false, value: null });
    assertEquals(await it.next().value, { done: false, value: "ABC" });
    assertEquals(it.next(), { done: true, value: undefined });
  },
});
