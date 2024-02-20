type Link<T> = null | { elem: T; link: Link<T> };
export interface List<T> {
  head: Link<T>;
  tail: Link<T>;
}
export function empty<T>(): List<T> {
  return { head: null, tail: null };
}
export function enqueue<T>(list: List<T>, elem: T) {
  const link: Link<T> = { elem, link: null };
  if (list.tail === null) list.head = link;
  else list.tail.link = link;
  list.tail = link;
}
export function dequeue<T>(list: List<T>): T {
  if (list.head === null) throw new Error("dequeue empty list");
  const link = list.head;
  list.head = link.link;
  return link.elem;
}
export function isEmpty<T>(list: List<T>): boolean {
  return list.head === null;
}
