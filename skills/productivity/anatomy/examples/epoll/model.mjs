export const FDS = Object.freeze([17, 23, 42]);
export const ARRIVAL_BYTES = 2048;
export const READ_BYTES = 1024;
export const MAX_BYTES = 4096;
export const DEMO_LAST_STEP = 5;

function assertMode(mode) {
  if (mode !== "LT" && mode !== "ET") throw new RangeError(`unknown trigger mode: ${mode}`);
}

function channelOf(state, fd) {
  const channel = state.channels.find((item) => item.fd === fd);
  if (!channel) throw new RangeError(`unknown fd: ${fd}`);
  return channel;
}

function copy(state, channels = state.channels) {
  return { ...state, channels: channels.map((channel) => ({ ...channel })), returned: [...state.returned] };
}

export function createState(mode = "LT") {
  assertMode(mode);
  return {
    mode,
    selected: FDS[0],
    channels: FDS.map((fd) => ({ fd, bytes: 0, ready: false, edgePending: false })),
    returned: [],
    waits: 0,
    reads: 0,
  };
}

export function selectFd(state, fd) {
  channelOf(state, fd);
  return { ...state, selected: fd };
}

export function setMode(_state, mode) {
  return createState(mode);
}

export function addData(state, fd = state.selected, amount = ARRIVAL_BYTES) {
  if (!Number.isInteger(amount) || amount <= 0) throw new RangeError("amount must be a positive integer");
  channelOf(state, fd);
  const channels = state.channels.map((channel) => {
    if (channel.fd !== fd) return { ...channel };
    const wasEmpty = channel.bytes === 0;
    const bytes = Math.min(MAX_BYTES, channel.bytes + amount);
    const arrived = bytes > channel.bytes;
    const newlyReady = wasEmpty && arrived;
    return {
      ...channel,
      bytes,
      ready: state.mode === "LT" ? bytes > 0 : channel.ready || newlyReady,
      edgePending: state.mode === "ET" ? channel.edgePending || newlyReady : false,
    };
  });
  return copy(state, channels);
}

export function waitEvents(state, maxEvents = FDS.length) {
  if (!Number.isInteger(maxEvents) || maxEvents < 0) throw new RangeError("maxEvents must be a non-negative integer");
  const events = state.channels.filter((channel) => channel.ready).slice(0, maxEvents).map((channel) => channel.fd);
  const channels = state.channels.map((channel) => {
    if (!events.includes(channel.fd)) return { ...channel };
    if (state.mode === "LT") return { ...channel, ready: channel.bytes > 0 };
    return { ...channel, ready: false, edgePending: false };
  });
  return { ...copy(state, channels), returned: events, waits: state.waits + 1 };
}

export function readData(state, fd = state.selected, amount = READ_BYTES) {
  if (!Number.isInteger(amount) || amount <= 0) throw new RangeError("amount must be a positive integer");
  channelOf(state, fd);
  const channels = state.channels.map((channel) => {
    if (channel.fd !== fd) return { ...channel };
    const bytes = Math.max(0, channel.bytes - amount);
    const drained = bytes === 0;
    return {
      ...channel,
      bytes,
      ready: state.mode === "LT" ? bytes > 0 : channel.ready && !drained,
      edgePending: state.mode === "ET" && !drained ? channel.edgePending : false,
    };
  });
  return { ...copy(state, channels), reads: state.reads + 1 };
}

export function demoState(mode = "LT", fd = FDS[0], step = 0) {
  if (!Number.isInteger(step) || step < 0 || step > DEMO_LAST_STEP) throw new RangeError(`unknown demo step: ${step}`);
  let state = selectFd(createState(mode), fd);
  if (step >= 2) state = addData(state, fd);
  if (step >= 3) state = waitEvents(state);
  if (step >= 4) state = readData(state, fd);
  if (step >= 5) state = waitEvents(state);
  return state;
}

export function readyFds(state) {
  return state.channels.filter((channel) => channel.ready).map((channel) => channel.fd);
}

export function channelFor(state, fd = state.selected) {
  return { ...channelOf(state, fd) };
}
