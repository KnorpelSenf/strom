export function makeToMap<K, V>(source: AsyncIterable<[K, V]>) {
  return async (map: Map<K, V> = new Map()): Promise<Map<K, V>> => {
    for await (const [k, v] of source) {
      map.set(k, v);
    }
    return map;
  };
}
