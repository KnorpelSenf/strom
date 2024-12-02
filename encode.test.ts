import { assertEquals } from "@std/assert";
import { makeEncode } from "./encode.ts";

Deno.test({
  name: "encode empty",
  async fn() {
    function* source() {}
    const encode = makeEncode(source());
    const it = encode()[Symbol.iterator]();
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "encode single string",
  async fn() {
    function* source() {
      yield Promise.resolve({
        done: false,
        value: "ABC",
      });
    }
    const encode = makeEncode(source());
    const it = encode()[Symbol.iterator]();
    assertEquals(await it.next().value, {
      done: false,
      value: new Uint8Array([65, 66, 67]),
    });
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "encode stream",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: "A" });
      yield Promise.resolve({ done: false, value: "B" });
      yield Promise.resolve({ done: false, value: "C" });
    }
    const encode = makeEncode(source());
    const it = encode()[Symbol.iterator]();
    assertEquals(await it.next().value, {
      done: false,
      value: new Uint8Array([65]),
    });
    assertEquals(await it.next().value, {
      done: false,
      value: new Uint8Array([66]),
    });
    assertEquals(await it.next().value, {
      done: false,
      value: new Uint8Array([67]),
    });
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});
