/**
 * Batches rapid message content updates (streaming) to one React commit per frame.
 */
export function createBatchedContentUpdater(flush: (accumulated: string) => void): {
  push: (chunk: string) => void;
  flushNow: () => void;
} {
  let pending = "";
  let scheduled = false;
  let frameId = 0;

  const runFlush = () => {
    scheduled = false;
    frameId = 0;
    if (!pending) return;
    const delta = pending;
    pending = "";
    flush(delta);
  };

  const push = (chunk: string) => {
    pending += chunk;
    if (scheduled) return;
    scheduled = true;
    frameId = requestAnimationFrame(runFlush);
  };

  const flushNow = () => {
    if (frameId) cancelAnimationFrame(frameId);
    scheduled = false;
    frameId = 0;
    runFlush();
  };

  return { push, flushNow };
}
