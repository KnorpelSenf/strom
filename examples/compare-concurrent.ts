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
await Promise.all(urls.map(({ url }) => fetch(url)));
console.timeEnd();
