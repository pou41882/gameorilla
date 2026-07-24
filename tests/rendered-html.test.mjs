import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the branded Gameorilla homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Gameorilla \| Ape Vice Arcade<\/title>/i);
  assert.match(html, /Ape vice arcade\. Bananas on the line\./i);
  assert.match(html, /Fill in the Blank/i);
  assert.match(html, /Play for bananas\. Stay for the vice\./i);
  assert.match(html, /Night Shift Trivia/i);
  assert.match(html, /Neon Whodunit/i);
  assert.match(html, /PoundTown Games/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
