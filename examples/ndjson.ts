import { strom } from "../mod.ts";

const file = await fetch(import.meta.resolve("./data.ndjson"));
if (file.body === null) Deno.exit(1);

console.time();
const problem0 = await strom(file.body)
  .decode()
  .lines()
  .init()
  .map((line) => JSON.parse(line) as { url: string })
  .map(({ url }, i) => (console.log(i, url), fetch(url)))
  .buffer(20)
  .map((r, i) => (console.log(i), r.status))
  .toArray(Array<number>(20));

const problem = strom(problem0);
console.log("created strom");
const itr = problem[Symbol.asyncIterator]();
console.log("created itr");
let res: IteratorResult<number> | undefined = undefined;
while (!(res = await itr.next()).done) {
  const val = res.value;
  console.log(val, "received");
}
console.log("done received");
console.timeEnd();

if (problem) {
  console.log("downtime detected!");
} else {
  console.log("all good");
}
