import { type Deferred, deferred } from "./deps/std.ts";

/**
 * Holds information about how a strom completed.
 */
export interface Completion {
  /** Number of successfully processed elements */
  count: number;
  /** Whether the strom was run until completion */
  done: boolean;
}

/**
 * A handle controlling how the strom is run.
 */
export interface Handle {
  /** A state indicating whether the strom is still active */
  readonly state: "active" | "paused" | "closed";
  /** A promise that resolves as soon as the strom is done running */
  task: Promise<Completion>;
  /** Pauses running the strom */
  pause(): void;
  /** Resumes running the strom */
  resume(): void;
  /** Catches errors that might happen during the run */
  catch(onrejected: (reason: unknown) => unknown): Promise<Completion>;
}

export function makeRun<E>(source: AsyncIterable<E>) {
  return (
    callback: (element: E, index: number) => unknown | Promise<unknown> =
      () => {},
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
        if (state === "paused") await pause;
        try {
          await callback(element, count++);
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
      task,
    };

    return handle;
  };
}
