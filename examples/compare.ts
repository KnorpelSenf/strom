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
for (const { url } of urls) await fetch(url);
console.timeEnd();
