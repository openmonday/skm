import assert from "node:assert/strict";
import test from "node:test";
import { addData, channelFor, createState, demoState, readData, readyFds, waitEvents } from "./model.mjs";

test("wait returns only ready descriptors and does not consume payload", () => {
  let state = createState("LT");
  state = addData(state, 23);
  assert.deepEqual(readyFds(state), [23]);
  state = waitEvents(state);
  assert.deepEqual(state.returned, [23]);
  assert.equal(channelFor(state, 23).bytes, 2048);
});

test("LT remains ready until the receive buffer is drained", () => {
  let state = addData(createState("LT"), 17);
  state = waitEvents(state);
  assert.deepEqual(readyFds(state), [17]);
  state = readData(state, 17);
  assert.equal(channelFor(state, 17).bytes, 1024);
  assert.deepEqual(waitEvents(state).returned, [17]);
  state = readData(state, 17);
  assert.equal(channelFor(state, 17).bytes, 0);
  assert.deepEqual(readyFds(state), []);
});

test("ET consumes one edge and needs a drain before another rising edge", () => {
  let state = addData(createState("ET"), 42);
  state = waitEvents(state);
  assert.deepEqual(state.returned, [42]);
  assert.deepEqual(readyFds(state), []);
  state = readData(state, 42);
  assert.equal(channelFor(state, 42).bytes, 1024);
  state = addData(state, 42);
  assert.deepEqual(readyFds(state), []);
  state = readData(state, 42, 4096);
  state = addData(state, 42);
  assert.deepEqual(readyFds(state), [42]);
});

test("guided stages keep notification separate from payload reading", () => {
  for (const mode of ["LT", "ET"]) {
    assert.deepEqual(readyFds(demoState(mode, 23, 2)), [23]);
    const returned = demoState(mode, 23, 3);
    assert.deepEqual(returned.returned, [23]);
    assert.equal(channelFor(returned, 23).bytes, 2048);
    const partiallyRead = demoState(mode, 23, 4);
    assert.equal(channelFor(partiallyRead, 23).bytes, 1024);
    assert.deepEqual(demoState(mode, 23, 5).returned, mode === "LT" ? [23] : []);
  }
});

test("an empty wait returns no events", () => {
  assert.deepEqual(waitEvents(createState()).returned, []);
});
