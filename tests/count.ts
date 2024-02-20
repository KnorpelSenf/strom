import { strom } from "../mod.ts";
import { assertEquals } from "./deps/assert.ts";

Deno.test({
  name: "performs basic count operations",
  async fn() {
    const count = await strom([3, 1, 4, 9, 2, 6])
      .map((x) => x + 1)
      .map((x) => x + x)
      .parallel()
      .filter((x) => x < 10)
      .count();
    assertEquals(count, 3);
  },
});
