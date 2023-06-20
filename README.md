# strom

The ultimate streaming library for Deno.

- completely async
- fully concurrent
- trivial to use
- built around iterators

strom lets you morph iterators in concise functional ways:

```ts
await strom([3, 1, 4])
  .map((x) => [x, x * x])
  .filter(([, sq]) => sq < 10)
  .run(console.log);
// [ 3, 9 ]
// [ 1, 1 ]
```

strom is async. This means that all elements are passed lazily only once they
are needed—just like with async iterators!

If you build longer chains of async iterators, this usually always comes with a
performance penalty. Several async iterators will be run in sequence, lacking
concurrency. We will now see how strom is much faster than plain old iterators.

Let's say you have a data source that produces values slowly, such as data from
IO operations.

```ts
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
```

Let's now say you want to perform more slow async ops for these values.

```ts
async function inc(n: number) {
  await sleep();
  return n + 1;
}
async function double(n: number) {
  await sleep();
  return n + n;
}
```

With iterators, it could look something like this.

```ts
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
```

The output is:

```bash
producing 3
computed 8
producing 1
computed 4
producing 4
computed 10
iterators: 9020ms
```

As you can see, the elements are passed through the iterators one after the
other. There is no concurrency. This is by design of the
[async iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols).

Let's look at the same code written with strom:

```ts
console.time("strom");
const iter = strom(values())
  .map(inc)
  .map(double);
for await (const elem of iter) {
  console.log("computed", elem);
}
console.timeEnd("strom");
```

Check the output:

```bash
producing 3
computed 8
producing 1
computed 4
producing 4
computed 10
strom: 9016ms
```

So strom does the same thing as iterators by default (just in a more concise
way).

Let's speed things up by allowing strom to buffer elements in between. That way,
it can already fetch the next element while processing the current one, which
gives us full concurrency!

```ts
console.time("strom");
const iter = strom(values(), { buffer: 5 })
  .map(inc)
  .map(double);
for await (const elem of iter) {
  console.log("computed", elem);
}
console.timeEnd("strom");
```

Suddenly, it's MUCH faster:

```bash
producing 3
producing 1
producing 4
computed 8
computed 4
computed 10
strom: 5012ms
```

Whenever you are working with async iterators, you are missing out on
concurrency and readability.

Use strom.
