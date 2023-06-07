export function makeToRecord<E>(source: AsyncIterable<[string, E]>) {
  return async (record: Record<string, E> = {}): Promise<Record<string, E>> => {
    for await (const [k, v] of source) {
      record[k] = v;
    }
    return record;
  };
}
