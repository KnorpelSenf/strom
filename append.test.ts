import { assertEquals } from "@std/assert";
import { makeAppend } from "./append.ts";

Deno.test({
  name: "append none on empty",
  fn() {
    function* source() {}
    const append = makeAppend(source());
    const it = append()[Symbol.iterator]();
    assertEquals(it.next(), { done: true, value: undefined });
  },
});

Deno.test({
  name: "append one on empty",
  async fn() {
    function* source() {}
    function* add0(): Iterable<Promise<IteratorResult<number>>> {
      yield Promise.resolve({ done: false, value: 0 });
    }
    const append = makeAppend(source());
    const it = append(add0())[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: 0 });
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "append empty",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: 0 });
    }
    function* add0(): Iterable<Promise<IteratorResult<number>>> {
    }
    const append = makeAppend(source());
    const it = append(add0())[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: 0 });
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "append one",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: 0 });
    }
    function* add0(): Iterable<Promise<IteratorResult<number>>> {
      yield Promise.resolve({ done: false, value: 1 });
    }
    const append = makeAppend(source());
    const it = append(add0())[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: 0 });
    assertEquals(await it.next().value, { done: false, value: 1 });
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "append many",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: 0 });
    }
    function* add0(): Iterable<Promise<IteratorResult<number>>> {
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: 2 });
      yield Promise.resolve({ done: false, value: 3 });
    }
    function* add1(): Iterable<Promise<IteratorResult<number>>> {
    }
    function* add2(): Iterable<Promise<IteratorResult<number>>> {
      yield Promise.resolve({ done: false, value: 4 });
      yield Promise.resolve({ done: false, value: 5 });
    }
    const append = makeAppend(source());
    const it = append(add0(), add1(), add2())[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: 0 });
    assertEquals(await it.next().value, { done: false, value: 1 });
    assertEquals(await it.next().value, { done: false, value: 2 });
    assertEquals(await it.next().value, { done: false, value: 3 });
    assertEquals(await it.next().value, { done: false, value: 4 });
    assertEquals(await it.next().value, { done: false, value: 5 });
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "append concurrently",
  async fn() {
    let i = 0;
    function* source() {
      yield Promise.resolve({ done: false, value: 0 });
      while (true) {
        yield Promise.resolve({ done: true, value: undefined });
      }
    }
    function* add0() {}
    function* add1(): Iterable<Promise<IteratorResult<number>>> {
      yield Promise.resolve({ done: false, value: 1 });
      yield Promise.resolve({ done: false, value: 2 });
      yield Promise.resolve({ done: false, value: 3 });
      i++;
    }
    const append = makeAppend(source());
    const it = append(add0(), add1())[Symbol.iterator]();
    const promises = [it.next(), it.next(), it.next(), it.next()];
    assertEquals(i, 1);
    promises.push(it.next());
    assertEquals(await promises[0].value, { done: false, value: 0 });
    assertEquals(await promises[1].value, { done: false, value: 1 });
    assertEquals(await promises[2].value, { done: false, value: 2 });
    assertEquals(await promises[3].value, { done: false, value: 3 });
    assertEquals(await promises[4].value, { done: true, value: undefined });
  },
});
