import { strom } from "../mod.ts";

const urls = [
  { url: "https://github.com" },
  { url: "https://google.com" },
  { url: "https://wikipedia.org" },
  { url: "https://github.com" },
  { url: "https://google.com" },
  { url: "https://wikipedia.org" },
  { url: "https://github.com" },
  { url: "https://google.com" },
  { url: "https://wikipedia.org" },
  { url: "https://github.com" },
  { url: "https://google.com" },
  { url: "https://wikipedia.org" },
  { url: "https://github.com" },
  { url: "https://google.com" },
  { url: "https://wikipedia.org" },
  { url: "https://github.com" },
  { url: "https://google.com" },
  { url: "https://wikipedia.org" },
  { url: "https://github.com" },
  { url: "https://google.com" },
];
console.time();
await strom(urls)
  .map(({ url }) => fetch(url))
  .parallel()
  .run()
  .task();
console.timeEnd();
