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
 * A handle controlling how a strom is run.
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
  /** Sets a handler to catch errors that are thrown during the run */
  catch(onrejected: (reason: unknown) => unknown): Promise<Completion>;
}
export function makeRun<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    callback: (
      element: E,
      index: number,
    ) => unknown | Promise<unknown> = () => {},
  ): Handle => {
    let state: Handle["state"] = "active";
    let pause: PromiseWithResolvers<void>;
    let handleErr = (err: unknown) => {
      console.error(err);
    };
    const task = run();

    async function run() {
      let count = 0;
      for await (const element of source) {
        if (element.done) break;
        if (state === "paused") await pause.promise;
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
        pause = Promise.withResolvers();
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
