import test from "node:test";
import assert from "node:assert/strict";
import { boundedBytes, boundedText } from "../lib/security/fetch";

test("source collection bounds actual streamed bytes even when content length is missing or false", async () => {
  let cancelled = false;
  const response = new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.enqueue(new Uint8Array([4, 5, 6]));
      },
      cancel() {
        cancelled = true;
      },
    }),
    { headers: { "Content-Length": "2" } },
  );
  await assert.rejects(boundedBytes(response, 5), /Response too large/);
  assert.equal(cancelled, true);
});

test("bounded source reads preserve binary bytes and existing UTF-8 text behavior", async () => {
  const bytes = new Uint8Array([37, 80, 68, 70, 45, 0, 255, 195]);
  assert.deepEqual(await boundedBytes(new Response(bytes)), Buffer.from(bytes));
  assert.equal(
    await boundedText(new Response("École — youth")),
    "École — youth",
  );
});
