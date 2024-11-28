import { assertEquals } from "@std/assert";
import { makeBatch } from "./batch.ts";

Deno.test({
  name: "batch empty",
  async fn() {
    function* source() {}
    const batch = makeBatch(source());
    const it = batch(3)[Symbol.iterator]();
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "batch single incomplete",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: 0 });
    }
    const batch = makeBatch(source());
    const it = batch(3)[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: [0] });
    assertEquals(it.next(), { done: true, value: undefined });
  },
});

Deno.test({
  name: "batch single complete",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: 2 });
    }
    const batch = makeBatch(source());
    const it = batch(3)[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: [0, 1, 2] });
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "batch multiple incomplete",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: 2 });
      yield Promise.resolve({ done: false, value: 3 });
    }
    const batch = makeBatch(source());
    const it = batch(3)[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: [0, 1, 2] });
    assertEquals(await it.next().value, { done: false, value: [3] });
    assertEquals(it.next(), { done: true, value: undefined });
  },
});

Deno.test({
  name: "batch multiple complete",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: 0 });
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: 2 });
      yield Promise.resolve({ done: false, value: 3 });
    }
    const batch = makeBatch(source());
    const it = batch(2)[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: [0, 1] });
    assertEquals(await it.next().value, { done: false, value: [2, 3] });
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});
