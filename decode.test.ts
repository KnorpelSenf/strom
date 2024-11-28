import { assertEquals } from "@std/assert";
import { makeDecode } from "./decode.ts";

Deno.test({
  name: "decode empty",
  async fn() {
    function* source() {}
    const decode = makeDecode(source());
    const it = decode()[Symbol.iterator]();
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "decode single buffer",
  async fn() {
    function* source() {
      yield Promise.resolve({
        done: false,
        value: new Uint8Array([65, 66, 67]),
      });
    }
    const decode = makeDecode(source());
    const it = decode()[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: "ABC" });
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});

Deno.test({
  name: "decode stream",
  async fn() {
    function* source() {
      yield Promise.resolve({ done: false, value: new Uint8Array([65]) });
      yield Promise.resolve({ done: false, value: new Uint8Array([66]) });
      yield Promise.resolve({ done: false, value: new Uint8Array([67]) });
    }
    const decode = makeDecode(source());
    const it = decode()[Symbol.iterator]();
    assertEquals(await it.next().value, { done: false, value: "A" });
    assertEquals(await it.next().value, { done: false, value: "B" });
    assertEquals(await it.next().value, { done: false, value: "C" });
    assertEquals(await it.next().value, { done: true, value: undefined });
  },
});
