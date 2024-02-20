type Link<T> = null | { elem: T; link: Link<T> };
export interface List<T> {
  head: Link<T>;
  tail: Link<T>;
}
export function empty<T>(): List<T> {
  return { head: null, tail: null };
}
export function enqueue<T>(list: List<T>, elem: T) {
  const tail: Link<T> = { elem, link: null };
  if (list.tail === null) list.head = tail;
  else list.tail.link = tail;
  list.tail = tail;
}
export function dequeue<T>(list: List<T>): T {
  const head = list.head;
  if (head === null) throw new Error("dequeue empty list");
  if (head.link === null) list.tail = null;
  list.head = head.link;
  return head.elem;
}
export function isEmpty<T>(list: List<T>): boolean {
  return list.head === null;
}
