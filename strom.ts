import { makeBuffer } from "./buffer.ts";
import { makeFilter } from "./filter.ts";
import { makeFlatMap } from "./flat_map.ts";
import { makeLog } from "./log.ts";
import { makeMap } from "./map.ts";
import { makepeek } from "./peek.ts";
import { type Handle, makeRun } from "./run.ts";
import { type StromSource, toIterable } from "./source.ts";

export { type Completion, type Handle } from "./run.ts";
export { type StromSource } from "./source.ts";

/**
 * Options to pass when creating a strom.
 */
export interface StromOptions {
  /**
   * Buffer to insert after each operation.
   */
  buffer?: number;
}

/**
 * A strom is a stream of elements.
 */
export interface Strom<E> extends AsyncIterable<E> {
  /**
   * Filters down the strom based on a given predicate function, or truthiness
   * if no predicate was specifed.
   *
   * @param predicate Function to determine which elements to keep
   */
  filter<T extends E>(predicate: (element: E) => element is T): Strom<T>;
  filter(predicate: (element: E) => boolean): Strom<E>;
  filter(): Strom<NonNullable<E>>;

  /**
   * Transforms every element in the strom using a given transform function.
   *
   * @param transform A function mapping one value to another
   */
  map<T>(transform: (element: E) => T | Promise<T>): Strom<T>;
  /**
   * Turns every element in the strom into many elements using a given transform
   * function, and returns a stream from all those elements.
   *
   * @param transform A function mapping one value to many
   */
  flatMap<T>(transform: (element: E) => StromSource<T>): Strom<T>;

  /**
   * Eagerly buffers as many elements as specified (default: 1).
   *
   * @param size Number of elements to buffer
   */
  buffer(size?: number): Strom<E>;

  /**
   * Peeks every element in the stream. Useful if you want to perform
   * side-effects. Usually, this method should be avoided.
   *
   * @param callback A callback function peeking the elements
   */
  peek(callback: (element: E) => unknown): Strom<E>;
  /**
   * Logs all elements in the stream.
   *
   * @param logger A custom logger function
   */
  log(logger?: (element: E) => string | string[]): Strom<E>;
  /**
   * Runs the strom until completion, optionally calling a callback function for
   * every element.
   *
   * @param callback A function consuming the elements
   */
  run(callback?: (element: E) => unknown): Handle;
}

/**
 * Creates a strom from a given data source.
 *
 * @param source A data source
 * @param options Optional options for creating the strom
 */
export function strom<E>(
  source: StromSource<E>,
  options: StromOptions = {},
): Strom<E> {
  return makeStrom(toIterable(source), options);
}
function makeStrom<E>(
  source: AsyncIterable<E>,
  options: StromOptions,
): Strom<E> {
  if (options.buffer !== undefined) {
    // buffer initial source
    source = makeStrom(source, { ...options, buffer: undefined })
      .buffer(options.buffer);
  }

  function toStrom<T>(source: AsyncIterable<T>, opts = options) {
    let strom = makeStrom(source, opts);
    if (opts.buffer !== undefined) {
      // buffer after subsequent async ops
      strom = strom.buffer(opts.buffer);
    }
    return strom;
  }

  const filter = makeFilter(source);
  const map = makeMap(source);
  const flatMap = makeFlatMap(source);
  const buffer = makeBuffer(source);
  const peek = makepeek(source);
  const log = makeLog(source);
  const run = makeRun(source);

  const strom: Strom<E> = {
    filter(...args: []) {
      return toStrom(filter(...args)) as Strom<NonNullable<E>>;
    },
    map(...args) {
      return toStrom(map(...args));
    },
    flatMap(...args) {
      return toStrom(flatMap(...args));
    },
    buffer(...args) {
      return toStrom(buffer(...args), { ...options, buffer: undefined });
    },
    peek(...args) {
      return toStrom(peek(...args));
    },
    log(...args) {
      return toStrom(log(...args), { ...options, buffer: undefined });
    },
    [Symbol.asyncIterator]() {
      return source[Symbol.asyncIterator]();
    },
    run,
  };

  return strom;
}

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
const concurrent = strom(values(), { buffer: undefined })
  .map(inc)
  .map(double);
for await (const elem of concurrent) {
  console.log("computed", elem);
}
console.timeEnd("strom");
