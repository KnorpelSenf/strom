export function makeContains<E>(source: AsyncIterable<E>) {
  return async (element: E): Promise<boolean> => {
    for await (const e of source) if (e === element) return true;
    return false;
  };
}
