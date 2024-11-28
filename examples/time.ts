import { strom } from "../mod.ts";

async function sleep() {
  await new Promise((r) => setTimeout(r, 1000));
}
async function* values() {
  for (const n of [3, 1, 4]) {
    console.log("producing", n);
    await sleep();
    yield n;
  }
}

async function inc(n: number) {
  await sleep();
  return n + 1;
}
async function double(n: number) {
  await sleep();
  return n + n;
}

async function* incItr() {
  for await (const n of values()) yield await inc(n);
}
async function* doubleItr() {
  for await (const n of incItr()) yield await double(n);
}

console.time("iterators");
for await (const elem of doubleItr()) {
  console.log("computed", elem);
}
console.timeEnd("iterators");

console.time("strom");
const concurrent = strom(values())
  .map(inc)
  .map(double)
  .parallel(3);
for await (const elem of concurrent) {
  console.log("computed", elem);
}
console.timeEnd("strom");
