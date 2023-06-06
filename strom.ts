import { makeBatch } from "./batch.ts";
import { makeBuffer } from "./buffer.ts";
import { makeDrop } from "./drop.ts";
import { makeDropWhile } from "./drop_while.ts";
import { makeFilter } from "./filter.ts";
import { makeFlatMap } from "./flat_map.ts";
import { makeHead } from "./head.ts";
import { makeInit } from "./init.ts";
import { makeLast } from "./last.ts";
import { makeLog } from "./log.ts";
import { makeMap } from "./map.ts";
import { makePartition } from "./partition.ts";
import { makepeek } from "./peek.ts";
import { makePop } from "./pop.ts";
import { type Handle, makeRun } from "./run.ts";
import { type StromSource, toIterable } from "./source.ts";
import { makeSpan } from "./span.ts";
import { makeSplitAt } from "./split_at.ts";
import { makeTail } from "./tail.ts";
import { makeTake } from "./take.ts";
import { makeTakeWhile } from "./take_while.ts";
import { makeUnzip } from "./unzip.ts";
import { makeZip } from "./zip.ts";
import { makeZipWith } from "./zip_with.ts";

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
   * Filters down the strom based on a given predicate function, or not nullish
   * if no predicate was specifed.
   *
   * @param predicate Function to determine which elements to keep
   */
  filter<T extends E>(predicate: (element: E) => element is T): Strom<T>;
  filter(predicate: (element: E) => boolean | Promise<boolean>): Strom<E>;
  filter(): Strom<NonNullable<E>>;
  /**
   * Collects a given number of elements into a tuple, and returns a strom of
   * tuples.
   *
   * @param count Number of elements in a tuple
   */
  batch(count: number): Strom<E[]>;

  /**
   * Gets the first element of the strom. Returns `undefined` if the strom has
   * no elements.
   */
  head(): Promise<E | undefined>;
  /** Drops the first element of the strom. */
  tail(): Strom<E>;
  /** Drops the last element of the strom. */
  init(): Strom<E>;
  /**
   * Gets the last element of the strom. Returns `undefined` if the strom has
   * no elements.
   */
  last(): Promise<E | undefined>;
  /**
   * Decomposes a strom into its first element and the remaining strom. Returns
   * a pair of `undefined` and the empty strom if the strom has no elements.
   */
  pop(): Promise<[E | undefined, Strom<E>]>;
  /**
   * Limits the strom to the given number of elements, dropping all others.
   *
   * @param count The number of elements to take.
   */
  take(count: number): Strom<E>;
  /**
   * Returns the longest prefix of the strom which contains elements that
   * satisfy a given predicate, or elements that are not nullish if no predicate
   * was specified.
   *
   * @param predicate A predicate determining the prefix
   */
  takeWhile(predicate?: (e: E) => boolean | Promise<boolean>): Strom<E>;
  /**
   * Drops the first given number of elements.
   *
   * @param count The number of elements to drop.
   */
  drop(count: number): Strom<E>;
  /**
   * Returns the longest prefix of the strom which contains elements that do not
   * satisfy a given predicate, or elements that are nullish if no predicate was
   * specified.
   *
   * @param predicate A predicate determining the prefix
   */
  dropWhile(predicate?: (e: E) => boolean | Promise<boolean>): Strom<E>;
  /**
   * Returns a pair of two stroms. The first strom contains as many elements as
   * specified. The second strom contains all remaining elements.
   *
   * @param index The number of elements in the first strom
   */
  splitAt(index: number): [Strom<E>, Strom<E>];
  /**
   * Returns a pair of two stroms. The first strom is the longest prefix of the
   * strom which contains elements that satisfy a given predicate. The second
   * strom contains all remaining elements.
   *
   * @param predicate A predicate determining where to split the strom
   */
  span(predicate: (e: E) => boolean | Promise<boolean>): [Strom<E>, Strom<E>];
  /**
   * Takes a predicate and returns a pair of stroms of elements that satisfy and
   * do not satisfy the given predicate, respectively. In other words, the first
   * returned strom contains all elements that satisfy the given predicate, and
   * the second strom contains all elements that do not satisfy the given
   * predicate.
   *
   * @param predicate A predicate
   */
  partition(
    predicate: (e: E) => boolean | Promise<boolean>,
  ): [Strom<E>, Strom<E>];

  /**
   * Zips two stroms into a strom of pairs.
   *
   * @param other A strom source to zip with.
   */
  zip<T>(other: StromSource<T>): Strom<[E, T]>;
  /**
   * Zips two stroms with a custom zipper function.
   *
   * @param other A strom source to zip with.
   * @param zipper A zipper function to apply on pairs.
   */
  zipWith<T, U>(
    other: StromSource<T>,
    zipper: (e: E, t: T) => U | Promise<U>,
  ): Strom<U>;
  /**
   * Decomposes a strom of pairs in a pair of stroms. The first strom contains
   * the first elements of each pair. The second strom contains the second
   * elements of each pair. Requires this strom to be a strom of pairs.
   */
  unzip(): E extends [infer T, infer U] ? [Strom<T>, Strom<U>] : never;

  /**
   * Turns string elements into Uint8Array elements by encoding them to UTF-8.
   * Requires this strom to be a strom of string elements.
   */
  encode(): E extends string ? Strom<Uint8Array> : never;

  /**
   * Turns Uint8Array elements into string elements by decoding them from UTF-8.
   * Requires this strom to be a strom of Uint8Array instances.
   */
  decode(): E extends Uint8Array ? Strom<string> : never;
  /**
   * When regarding a strom of string elements as one large string `s`, this
   * method returns a strom of the elements of `s`, split at a given separator
   * string (or regular expression).
   *
   * @param on Separator string or regular expression
   */
  split(on: string | RegExp): E extends string ? Strom<string> : never;
  /**
   * Turns a strom of string elements into its lines, as determined by `\n` or
   * `\r\n`.
   */
  lines(): E extends string ? Strom<string> : never;
  /**
   * Intersperses a given element between each two elements in the strom. The
   * given element may be generated by a supplier function.
   *
   * @param separator A separator element
   */
  intersperse(separator: E | ((index: number) => E | Promise<E>)): Strom<E>;

  /**
   * Collects all elements of the strom into a set and returns it.
   *
   * @param set An optional set to modify
   */
  toSet(set?: Set<E>): Promise<Set<E>>;
  /**
   * Collects all elements of the strom into a map and returns it. Requires the
   * strom to be a strom of key-value pairs.
   *
   * @param map An optional map to modify
   */
  toMap(
    map?: E extends [infer K, infer V] ? Map<K, V> : never,
  ): E extends [infer K, infer V] ? Promise<Map<K, V>> : never;
  /**
   * Collects all elements of the strom into an object and returns it. Requires
   * the strom to be a strom of key-value pairs where the key is of type string.
   *
   * @param record An optional record to modify
   */
  toRecord(
    record?: E extends [string, infer T] ? Record<string, T> : never,
  ): E extends [string, infer T] ? Record<string, T> : never;
  /**
   * Collects all elements of the strom into an array and returns it. If a
   * buffer array is given, only as many elements are collected into the given
   * array as possible without increasing the length of the array.
   */
  toArray(buffer?: E[]): Promise<E[]>;
  /**
   * Concatenates all string elements of the strom. Requires the strom to be a
   * strom of string elements. Returns the empty string if the strom has no
   * elements.
   */
  toString(): E extends string ? Promise<string> : never;

  /**
   * Reduces the strom of elements into an accumulator. If no initial
   * accumulator is given, the first element of the strom will be used.
   *
   * @param combine A function adding the next element to the accumulator
   * @param initial An optional inital accumulator
   */
  reduce<T = E>(
    combine: (acc: T, element: E) => T | Promise<T>,
    initial?: T,
  ): Promise<T>;

  /**
   * Prepends a number of stroms to this strom, yielding their elements before
   * this strom's elements.
   *
   * @param others Stroms to yield before this strom.
   */
  prepend(...others: StromSource<E>[]): Strom<E>;
  /**
   * Appends a number of stroms to this strom, yielding their elements after
   * this strom's elements.
   *
   * @param others Stroms to yield after this strom.
   */
  append(...others: StromSource<E>[]): Strom<E>;

  /**
   * Transforms every element in the strom using a given transform function.
   *
   * @param transform A function mapping one value to another
   */
  map<T>(transform: (element: E, index: number) => T | Promise<T>): Strom<T>;
  /**
   * Turns every element in the strom into many elements using a given transform
   * function, and returns a stream from all those elements.
   *
   * @param transform A function mapping one value to many
   */
  flatMap<T>(transform: (element: E, index: number) => StromSource<T>): Strom<T>;

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

  /**
   * Returns the number of elements in the strom, thereby consuming the strom.
   */
  count(): Promise<number>;
  /**
   * Tests the elements of the strom against a given predicate function, or
   * tests them for not being nullish if no predicate was given. Returns `true`
   * as soon as the first element satisfies the predicate, without inspecting
   * any subsequent elements. Returns `false` if no element satisfied the
   * predicate.
   *
   * @param predicate A predicate function used to test the elements
   */
  some(predicate?: (e: E) => boolean | Promise<boolean>): Promise<boolean>;
  /**
   * Tests the elements of the strom against a given predicate function, or
   * tests them for not being nullish if no predicate was given. Returns `true`
   * if all elements satisfied the the predicate. Returns `false` as soon as the
   * first element does not satisfy the predicate, whithout inspecting any
   * subsequent elements.
   *
   * @param predicate A predicate function used to test the elements
   */
  every(predicate?: (e: E) => boolean | Promise<boolean>): Promise<boolean>;
  /**
   * Tests the elements of the strom for being truthy. If all elements are
   * truthy, `true` is returned. Returns `false` as soon as the first element is
   * falsy, whithout inspecting any subsequent elements.
   */
  all(): Promise<boolean>;
  /**
   * Tests the elements of the strom for being truthy. If no element is truthy,
   * `false` is returned. Returns `true` as soon as the first element is truthy,
   * whithout inspecting any subsequent elements.
   */
  any(): Promise<boolean>;

  /**
   * Checks if any of the elements in the strom is strictly equal (`===`) to the
   * given element. Returns `true` as soon as the first element is equal,
   * without inspecting any subsequent elements. Returns `false` if no element
   * is equal.
   *
   * @param e An element which may be contained in the strom
   */
  contains(e: E): Promise<boolean>;
  /**
   * Returns the largest element of the strom. Uses `String#localeCompare` if
   * the strom is a strom of string elements. Uses `<` otherwise. Returns
   * `undefined` if the strom has no elements.
   *
   * @param compare An optional comparison function
   */
  max(compare?: (l: E, r: E) => number): Promise<E>;
  /**
   * Returns the smallest element of the strom. Uses `String#localeCompare` if
   * the strom is a strom of string elements. Uses `<` otherwise. Returns
   * `undefined` if the strom has no elements.
   *
   * @param compare An optional comparison function
   */
  min(compare?: (l: E, r: E) => number): Promise<E>;
  /**
   * Sums up all values of the strom using `+` on whatever values are in the
   * strom. Returns
   * `undefined` if the strom has no elements.
   */
  sum(): Promise<E>;
  /**
   * Multiplies all values of the strom using `*` on whatever values are in the
   * strom. Returns
   * `undefined` if the strom has no elements.
   */
  product(): Promise<E>;
  /**
   * Returns the first element that matches a given predicate function, or
   * `undefined` if no such element is contained in the strom.
   */
  find(
    predicate?: (e: E) => boolean | Promise<boolean>,
  ): Promise<E | undefined>;
  /**
   * Returns the index of first element that matches a given predicate function,
   * or `undefined` if no such element is contained in the strom.
   */
  findIndex(
    predicate?: (e: E) => boolean | Promise<boolean>,
  ): Promise<number | undefined>;
  /**
   * Returns a strom with duplicate elements removed. The resulting strom only
   * contains the first occurrence of each element. The equality comparison is
   * performed by a given comparison function, or by a `Set` if no comparison
   * function was given.
   *
   * > Note that this method requires a significant memory overhead, as it needs
   * > to keep previously yielded elements in memory.
   */
  unique(
    compare?: (element: E, other: E) => boolean | Promise<boolean>,
  ): Strom<E>;
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

  const toStrom = <T>(source: AsyncIterable<T>, opts = options) =>
    makeStrom(source, opts);

  const strom: Strom<E> = {
    async head() {
      const head = makeHead(source);
      return await head();
    },
    tail() {
      const tail = makeTail(source);
      return toStrom(tail());
    },
    init() {
      const init = makeInit(source);
      return toStrom(init());
    },
    async last() {
      const last = makeLast(source);
      return await last();
    },
    async pop() {
      const pop = makePop(source);
      const [first, rest] = await pop();
      return [first, toStrom(rest)];
    },
    take(count) {
      const take = makeTake(source);
      return toStrom(take(count));
    },
    takeWhile(predicate) {
      const takeWhile = makeTakeWhile(source);
      return toStrom(takeWhile(predicate));
    },
    drop(count) {
      const drop = makeDrop(source);
      return toStrom(drop(count));
    },
    dropWhile(predicate) {
      const dropWhile = makeDropWhile(source);
      return toStrom(dropWhile(predicate));
    },
    splitAt(index) {
      const splitAt = makeSplitAt(source);
      const [before, after] = splitAt(index);
      return [toStrom(before), toStrom(after)];
    },
    span(predicate) {
      const span = makeSpan(source);
      const [before, after] = span(predicate);
      return [toStrom(before), toStrom(after)];
    },
    partition(predicate) {
      const partition = makePartition(source);
      const [before, after] = partition(predicate);
      return [toStrom(before), toStrom(after)];
    },
    zip(other) {
      const zip = makeZip(source);
      return toStrom(zip(toIterable(other)));
    },
    zipWith(other, zipper) {
      const zipWith = makeZipWith(source);
      return toStrom(zipWith(toIterable(other), zipper));
    },
    unzip() {
      const unzip = makeUnzip(source);
      const [left, right] = unzip();
      // deno-lint-ignore no-explicit-any
      return [toStrom(left), toStrom(right)] as any;
    },
    filter(...args: []) {
      const filter = makeFilter(source);
      return toStrom(filter(...args)) as Strom<NonNullable<E>>;
    },
    batch(count) {
      const batch = makeBatch(source);
      return toStrom(batch(count));
    },
    map(transform) {
      const map = makeMap(source);
      return toStrom(map(transform));
    },
    flatMap(transform) {
      const flatMap = makeFlatMap(source);
      return toStrom(flatMap(transform));
    },
    buffer(size) {
      const buffer = makeBuffer(source);
      return toStrom(buffer(size), { ...options, buffer: undefined });
    },
    peek(callback) {
      const peek = makepeek(source);
      return toStrom(peek(callback));
    },
    log(logger) {
      const log = makeLog(source);
      return toStrom(log(logger), { ...options, buffer: undefined });
    },
    [Symbol.asyncIterator]() {
      return source[Symbol.asyncIterator]();
    },
    run(callback) {
      const run = makeRun(source);
      return run(callback);
    },
  };
  return strom;
}
