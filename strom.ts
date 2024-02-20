import { type Deferred, deferred } from "./deps/std.ts";

import { makeBuffer } from "./buffer.ts";
import { makeCount } from "./count.ts";
import { makeFilter } from "./filter.ts";
import { makeHead } from "./head.ts";
import { makeLog } from "./log.ts";
import { makeMap } from "./map.ts";
import { makeReduce } from "./reduce.ts";
import { makeTail } from "./tail.ts";
import { makeToArray } from "./to_array.ts";
import { makeZip } from "./zip.ts";
import { makeTake } from "./take.ts";
import { makeUnique } from "./unique.ts";

/**
 * Source for a strom. Can be any iterator.
 */
export type StromSource<E> =
  | Iterable<E>
  | AsyncIterable<E>
  | Iterator<E>
  | AsyncIterator<E>
  | { stream(): StromSource<E> };

function toPromiseIterable<E>(
  source: StromSource<E>,
): Iterable<Promise<IteratorResult<E>>> {
  if (Symbol.iterator in source) {
    return fromUnwrapped(() => source[Symbol.iterator]());
  } else if (Symbol.asyncIterator in source) {
    return fromUnwrapped(() => source[Symbol.asyncIterator]());
  } else if ("stream" in source) {
    return toPromiseIterable(source.stream());
  } else {
    return fromUnwrapped(() => source);
  }
}
function fromUnwrapped<E>(
  getIterator: () => Iterator<E> | AsyncIterator<E>,
): Iterable<Promise<IteratorResult<E>>> {
  return {
    [Symbol.iterator]() {
      const it = getIterator();
      return {
        next(): IteratorResult<Promise<IteratorResult<E>>> {
          async function convert(): Promise<IteratorResult<E>> {
            const res: IteratorResult<E> = await it.next();
            if (res.done) return { done: true, value: undefined };
            else return { done: false, value: res.value };
          }
          return { done: false, value: convert() };
        },
      };
    },
  };
}

/**
 * A strom is a stream of elements.
 */
export interface Strom<E>
  extends Iterable<Promise<IteratorResult<E>>>, AsyncIterable<E> {
  // Remove elements
  /**
   * Filters down the strom based on a given predicate function, or not nullish
   * if no predicate was specifed.
   *
   * @param predicate Function to determine which elements to keep
   */
  filter<T extends E>(
    predicate: (element: E, index: number) => element is T,
  ): Strom<T>;
  filter(
    predicate: (element: E, index: number) => boolean | Promise<boolean>,
  ): Strom<E>;
  filter(): Strom<NonNullable<E>>;
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
  // takeWhile(
  //   predicate?: (element: E, index: number) => boolean | Promise<boolean>,
  // ): Strom<E>;
  /**
   * Drops the first given number of elements.
   *
   * @param count The number of elements to drop.
   */
  // drop(count: number): Strom<E>;
  /**
   * Returns the longest prefix of the strom which contains elements that do not
   * satisfy a given predicate, or elements that are nullish if no predicate was
   * specified.
   *
   * @param predicate A predicate determining the prefix
   */
  // dropWhile(
  //   predicate?: (element: E, index: number) => boolean | Promise<boolean>,
  // ): Strom<E>;
  /**
   * Returns a strom with duplicate elements removed. The resulting strom only
   * contains the first occurrence of each element. The equality comparison is
   * performed by a `Set`.
   *
   * > Note that this method requires a significant memory overhead, as it needs
   * > to keep previously yielded elements in memory.
   */
  unique(): Strom<E>;

  // Concatenate
  /**
   * Prepends a number of stroms to this strom, yielding their elements before
   * this strom's elements.
   *
   * @param others Stroms to yield before this strom.
   */
  // prepend(...others: StromSource<E>[]): Strom<E>;
  /**
   * Appends a number of stroms to this strom, yielding their elements after
   * this strom's elements.
   *
   * @param others Stroms to yield after this strom.
   */
  // append(...others: StromSource<E>[]): Strom<E>;
  /**
   * Intersperses a given element between each two elements in the strom.
   *
   * @param separator A separator element
   */
  // intersperse(separator: E): Strom<E>;

  // Transform
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
  // flatMap<T>(
  //   transform: (element: E, index: number) => StromSource<T>,
  // ): Strom<T>;
  /**
   * Turns string elements into Uint8Array elements by encoding them to UTF-8.
   * Requires this strom to be a strom of string elements.
   */
  // encode(): E extends string ? Strom<Uint8Array> : never;
  /**
   * Turns Uint8Array elements into string elements by decoding them from UTF-8.
   * Requires this strom to be a strom of Uint8Array instances.
   */
  // decode(): E extends Uint8Array ? Strom<string> : never;
  /**
   * When regarding a strom of string elements as one large string `s`, this
   * method returns a strom of the elements of `s`, split at a given separator
   * string (or regular expression).
   *
   * @param on Separator string or regular expression
   */
  // split(on: string | RegExp): E extends string ? Strom<string> : never;
  /**
   * Turns a strom of string elements into its lines, as determined by `\n` or
   * `\r\n`.
   */
  // lines(): E extends string ? Strom<string> : never;
  /**
   * Collects a given number of elements into a tuple, and returns a strom of
   * tuples.
   *
   * @param count Number of elements in a tuple
   */
  // batch(count: number): Strom<E[]>;

  // Compose or decompose
  /**
   * Gets the first element of the strom. Returns `undefined` if the strom has
   * no elements.
   */
  head(): Promise<E | undefined>;
  /** Drops the first element of the strom. */
  tail(): Strom<E>;
  /** Drops the last element of the strom. */
  // init(): Strom<E>;
  /**
   * Gets the last element of the strom. Returns `undefined` if the strom has
   * no elements.
   */
  // last(): Promise<E | undefined>;
  /**
   * Decomposes a strom into its first element and the remaining strom. Returns
   * a pair of `undefined` and the empty strom if the strom has no elements.
   */
  // pop(): Promise<[E | undefined, Strom<E>]>;
  /**
   * Returns a pair of two stroms. The first strom contains as many elements as
   * specified. The second strom contains all remaining elements.
   *
   * @param index The number of elements in the first strom
   */
  // splitAt(index: number): [Strom<E>, Strom<E>];
  /**
   * Returns a pair of two stroms. The first strom is the longest prefix of the
   * strom which contains elements that satisfy a given predicate. The second
   * strom contains all remaining elements.
   *
   * @param predicate A predicate determining where to split the strom
   */
  // span(
  //   predicate: (element: E, index: number) => boolean | Promise<boolean>,
  // ): [Strom<E>, Strom<E>];
  /**
   * Takes a predicate and returns a pair of stroms of elements that satisfy and
   * do not satisfy the given predicate, respectively. In other words, the first
   * returned strom contains all elements that satisfy the given predicate, and
   * the second strom contains all elements that do not satisfy the given
   * predicate.
   *
   * @param predicate A predicate
   */
  // partition(
  //   predicate: (element: E, index: number) => boolean | Promise<boolean>,
  // ): [Strom<E>, Strom<E>];
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
  // zipWith<T, U>(
  //   other: StromSource<T>,
  //   zipper: (element: E, other: T) => U | Promise<U>,
  // ): Strom<U>;
  /**
   * Decomposes a strom of pairs in a pair of stroms. The first strom contains
   * the first elements of each pair. The second strom contains the second
   * elements of each pair. Requires this strom to be a strom of pairs.
   */
  // unzip(): E extends [infer T, infer U] ? [Strom<T>, Strom<U>] : never;

  // Collect
  /**
   * Collects all elements of the strom into a set and returns it.
   *
   * @param set An optional set to modify
   */
  // toSet(set?: Set<E>): Promise<Set<E>>;
  /**
   * Collects all elements of the strom into a map and returns it. Requires the
   * strom to be a strom of key-value pairs.
   *
   * @param map An optional map to modify
   */
  // toMap(
  //   map?: E extends [infer K, infer V] ? Map<K, V> : never,
  // ): Promise<E extends [infer K, infer V] ? Map<K, V> : never>;
  /**
   * Collects all elements of the strom into an object and returns it. Requires
   * the strom to be a strom of key-value pairs where the key is of type string.
   *
   * @param record An optional record to modify
   */
  // toRecord(
  //   record?: E extends [string, infer T] ? Record<string, T> : never,
  // ): Promise<E extends [string, infer T] ? Record<string, T> : never>;
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
  // toString(): Promise<E extends string ? string : never>;
  /**
   * Runs the strom until completion, optionally calling a callback function for
   * every element.
   *
   * @param callback A function consuming the elements
   */
  run(callback?: (element: E, index: number) => unknown): Handle;

  // Reduce
  /**
   * Reduces the strom of elements into an accumulator. If no initial
   * accumulator is given, the first element of the strom will be used.
   *
   * @param combine A function adding the next element to the accumulator
   * @param initial An optional inital accumulator
   */
  reduce<T = E>(
    combine: (acc: T, element: E, index: number) => T | Promise<T>,
    initial?: T,
  ): Promise<T>;
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
  // some(
  //   predicate?: (element: E, index: number) => boolean | Promise<boolean>,
  // ): Promise<boolean>;
  /**
   * Tests the elements of the strom against a given predicate function, or
   * tests them for not being nullish if no predicate was given. Returns `true`
   * if all elements satisfied the the predicate. Returns `false` as soon as the
   * first element does not satisfy the predicate, whithout inspecting any
   * subsequent elements.
   *
   * @param predicate A predicate function used to test the elements
   */
  // every(
  //   predicate?: (element: E, index: number) => boolean | Promise<boolean>,
  // ): Promise<boolean>;
  /**
   * Tests the elements of the strom for being truthy. If all elements are
   * truthy, `true` is returned. Returns `false` as soon as the first element is
   * falsy, whithout inspecting any subsequent elements.
   */
  // all(): Promise<boolean>;
  /**
   * Tests the elements of the strom for being truthy. If no element is truthy,
   * `false` is returned. Returns `true` as soon as the first element is truthy,
   * whithout inspecting any subsequent elements.
   */
  // any(): Promise<boolean>;
  /**
   * Checks if any of the elements in the strom is strictly equal (`===`) to the
   * given element. Returns `true` as soon as the first element is equal,
   * without inspecting any subsequent elements. Returns `false` if no element
   * is equal.
   *
   * @param e An element which may be contained in the strom
   */
  // contains(element: E): Promise<boolean>;
  /**
   * Returns the largest element of the strom. Uses `String#localeCompare` if
   * the strom is a strom of string elements. Uses `<` otherwise. Returns
   * `undefined` if the strom has no elements.
   *
   * @param compare An optional comparison function
   */
  // max(compare?: (l: E, r: E) => number | Promise<number>): Promise<E>;
  /**
   * Returns the smallest element of the strom. Uses `String#localeCompare` if
   * the strom is a strom of string elements. Uses `<` otherwise. Returns
   * `undefined` if the strom has no elements.
   *
   * @param compare An optional comparison function
   */
  // min(compare?: (l: E, r: E) => number | Promise<number>): Promise<E>;
  /**
   * Sums up all values of the strom using `+` on whatever values are in the
   * strom. Returns
   * `undefined` if the strom has no elements.
   */
  // sum(): Promise<E>;
  /**
   * Multiplies all values of the strom using `*` on whatever values are in the
   * strom. Returns
   * `undefined` if the strom has no elements.
   */
  // product(): Promise<E>;
  /**
   * Returns the first element that matches a given predicate function, or
   * `undefined` if no such element is contained in the strom.
   */
  // find(
  //   predicate?: (element: E, index: number) => boolean | Promise<boolean>,
  // ): Promise<E | undefined>;
  /**
   * Returns the index of first element that matches a given predicate function,
   * or `undefined` if no such element is contained in the strom.
   */
  // findIndex(
  //   predicate?: (element: E, index: number) => boolean | Promise<boolean>,
  // ): Promise<number | undefined>;

  // Concurrency
  /**
   * Eagerly buffers as many elements as specified (default: 1).
   *
   * @param size Number of elements to buffer
   */
  buffer(size?: number): Strom<E>;

  // Debug
  /**
   * Peeks every element in the stream. Useful if you want to perform
   * side-effects. Usually, this method should be avoided.
   *
   * @param callback A callback function peeking the elements
   */
  // peek(callback: (element: E, index: number) => unknown): Strom<E>;
  /**
   * Logs all elements in the stream.
   *
   * @param logger A custom logger function
   */
  log(logger?: (element: E, index: number) => string | string[]): Strom<E>;
}

/**
 * Creates a strom from a given data source.
 *
 * @param source A data source
 * @param options Optional options for creating the strom
 */
export function strom<E>(source: StromSource<E>): Strom<E> {
  return hydrate(toPromiseIterable(source));
}
function hydrate<E>(source: Iterable<Promise<IteratorResult<E>>>): Strom<E> {
  return {
    // Remove elements
    filter(...args: []) {
      const filter = makeFilter(source);
      return hydrate(
        filter(...args) as Iterable<Promise<IteratorResult<NonNullable<E>>>>,
      );
    },
    take(count) {
      const take = makeTake(source);
      return hydrate(take(count));
    },
    // takeWhile(predicate) {
    //   const takeWhile = makeTakeWhile(source);
    //   return strom(takeWhile(predicate));
    // },
    // drop(count) {
    //   const drop = makeDrop(source);
    //   return strom(drop(count));
    // },
    // dropWhile(predicate) {
    //   const dropWhile = makeDropWhile(source);
    //   return strom(dropWhile(predicate));
    // },
    unique() {
      const unique = makeUnique(source);
      return hydrate(unique());
    },
    // // Concatenate
    // prepend(...others) {
    //   const prepend = makePrepend(source);
    //   return strom(prepend(...others));
    // },
    // append(...others) {
    //   const append = makeAppend(source);
    //   return strom(append(...others));
    // },
    // intersperse(separator) {
    //   const intersperse = makeIntersperse(source);
    //   return strom(intersperse(separator));
    // },
    // Transform
    map(transform) {
      const map = makeMap(source);
      return hydrate(map(transform));
    },
    // flatMap(transform) {
    //   const flatMap = makeFlatMap(source);
    //   return strom(flatMap(transform));
    // },
    // encode() {
    //   const encode = makeEncode(source as AsyncIterable<string>);
    //   const ret: Strom<Uint8Array> = strom(encode());
    //   // deno-lint-ignore no-explicit-any
    //   return ret as any; // cast to ?:
    // },
    // decode() {
    //   const decode = makeDecode(source as AsyncIterable<Uint8Array>);
    //   const ret: Strom<string> = strom(decode());
    //   // deno-lint-ignore no-explicit-any
    //   return ret as any; // cast to ?:
    // },
    // split(on) {
    //   const split = makeSplit(source as AsyncIterable<string>);
    //   const ret: Strom<string> = strom(split(on));
    //   // deno-lint-ignore no-explicit-any
    //   return ret as any; // cast to ?:
    // },
    // lines() {
    //   return this.split(/\r?\n/);
    // },
    // batch(count) {
    //   const batch = makeBatch(source);
    //   return strom(batch(count));
    // },
    // Compose or decompose
    async head() {
      const head = makeHead(source);
      return await head();
    },
    tail() {
      const tail = makeTail(source);
      return hydrate(tail());
    },
    // init() {
    //   const init = makeInit(source);
    //   return strom(init());
    // },
    // async last() {
    //   const last = makeLast(source);
    //   return await last();
    // },
    // async pop() {
    //   const pop = makePop(source);
    //   const [first, rest] = await pop();
    //   return [first, strom(rest)];
    // },
    // splitAt(index) {
    //   const splitAt = makeSplitAt(source);
    //   const [before, after] = splitAt(index);
    //   return [strom(before), toStrom(after)];
    // },
    // span(predicate) {
    //   const span = makeSpan(source);
    //   const [before, after] = span(predicate);
    //   return [strom(before), toStrom(after)];
    // },
    // partition(predicate) {
    //   const partition = makePartition(source);
    //   const [before, after] = partition(predicate);
    //   return [strom(before), toStrom(after)];
    // },
    zip(other) {
      const zip = makeZip(source);
      return hydrate(zip(toPromiseIterable(other)));
    },
    // zipWith(other, zipper) {
    //   const zipWith = makeZipWith(source);
    //   return strom(zipWith(toIterable(other), zipper));
    // },
    // unzip<T, U>() {
    //   const unzip = makeUnzip(source);
    //   const [left, right] = unzip<T, U>();
    //   const ret: [Strom<T>, Strom<U>] = [strom(left), toStrom(right)];
    //   // deno-lint-ignore no-explicit-any
    //   return ret as any; // cast to ?:
    // },
    // Collect
    // toSet(set) {
    //   const toSet = makeToSet(source);
    //   return toSet(set);
    // },
    // async toMap<K, V>(map?: Map<K, V>) {
    //   const toMap = makeToMap(source as AsyncIterable<[K, V]>);
    //   const ret: Map<K, V> = await toMap(map);
    //   // deno-lint-ignore no-explicit-any
    //   return ret as any; // cast to ?:
    // },
    // async toRecord<T>(record?: Record<string, T>) {
    //   const toRecord = makeToRecord(source as AsyncIterable<[string, T]>);
    //   const ret: Record<string, T> = await toRecord(record);
    //   // deno-lint-ignore no-explicit-any
    //   return ret as any;
    // },
    async toArray(buffer) {
      const toArray = makeToArray(source);
      return await toArray(buffer);
    },
    // async toString() {
    //   const toString = makeToString(source);
    //   const ret: string = await toString();
    //   // deno-lint-ignore no-explicit-any
    //   return ret as any;
    // },
    run(callback) {
      const run = makeRun(source);
      return run(callback);
    },
    // Reduce
    async reduce(combine, initial) {
      const reduce = makeReduce(source);
      return await reduce(combine, initial);
    },
    async count() {
      const count = makeCount(source);
      return await count();
    },
    // async some(predicate) {
    //   const some = makeSome(source);
    //   return await some(predicate);
    // },
    // async every(predicate) {
    //   const every = makeEvery(source);
    //   return await every(predicate);
    // },
    // async all() {
    //   const all = makeAll(source);
    //   return await all();
    // },
    // async any() {
    //   const any = makeAny(source);
    //   return await any();
    // },
    // async contains(element) {
    //   const contains = makeContains(source);
    //   return await contains(element);
    // },
    // async max(compare) {
    //   const max = makeMax(source);
    //   return await max(compare);
    // },
    // async min(compare) {
    //   const min = makeMin(source);
    //   return await min(compare);
    // },
    // async sum() {
    //   const sum = makeSum(source);
    //   return await sum();
    // },
    // async product() {
    //   const product = makeProduct(source);
    //   return await product();
    // },
    // async find(predicate) {
    //   const find = makeFind(source);
    //   return await find(predicate);
    // },
    // async findIndex(predicate) {
    //   const findIndex = makeFindIndex(source);
    //   return await findIndex(predicate);
    // },
    // Concurrency
    buffer(size) {
      const buffer = makeBuffer(source);
      return hydrate(buffer(size));
    },
    // Debug
    // peek(callback) {
    //   const peek = makepeek(source);
    //   return strom(peek(callback));
    // },
    log(logger) {
      const log = makeLog(source);
      return hydrate(log(logger));
    },
    // Interop
    [Symbol.iterator]: source[Symbol.iterator],
    async *[Symbol.asyncIterator]() {
      for (const promise of source) {
        const elem = await promise;
        if (elem.done) break;
        yield elem.value;
      }
    },
  };
}

/**
 * Holds information about how a strom completed.
 */
export interface Completion {
  /** Number of successfully processed elements */
  count: number;
  /** Whether the strom was run until completion */
  done: true;
}
/**
 * A handle controlling how the strom is run.
 */
export interface Handle {
  /** A state indicating whether the strom is still active */
  readonly state: "active" | "paused" | "closed";
  /** Returns a promise that resolves as soon as the strom is done running */
  task(): Promise<Completion>;
  /** Pauses running the strom */
  pause(): void;
  /** Resumes running the strom */
  resume(): void;
  /** Catches errors that might happen during the run */
  catch(onrejected: (reason: unknown) => unknown): Promise<Completion>;
}

function makeRun<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    callback: (
      element: E,
      index: number,
    ) => unknown | Promise<unknown> = () => {},
  ): Handle => {
    let state: Handle["state"] = "active";
    let pause: Deferred<void>;
    let handleErr = (err: unknown) => {
      console.error(err);
    };
    const task = run();

    async function run() {
      let count = 0;
      for await (const element of source) {
        if (element.done) break;
        if (state === "paused") await pause;
        try {
          await callback(element.value, count++);
        } catch (error) {
          handleErr(error);
        }
      }
      state = "closed";
      const result: Completion = { count, done: true };
      return result;
    }

    const handle: Handle = {
      get state() {
        return state;
      },
      pause() {
        state = "paused";
        pause = deferred();
      },
      resume() {
        state = "active";
        pause.resolve();
      },
      catch(onrejected) {
        handleErr = onrejected;
        return task;
      },
      task() {
        return task;
      },
    };

    return handle;
  };
}
