import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { kitScript } from "../../scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 720;
const HEIGHT = 430;
const PLATE = { x: -128, y: -65, w: 256, d: 130, r: 8 };
const ROWS = [-27, 0, 27];
const PORT_X = -110;
const BUFFER_X = -99;
const REG_NODES = [
  { id: "root", x: -31, y: 0, z: 22 },
  { id: "branch-a", x: -40, y: -13, z: 18 },
  { id: "branch-b", x: -40, y: 13, z: 18 },
  { id: "fd-17", x: -52, y: -27, z: 15 },
  { id: "fd-23", x: -52, y: -1, z: 15 },
  { id: "fd-42", x: -52, y: 27, z: 15 },
];
const TREE_LINKS = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]];
const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -14, 0),
    ...k.boxCorners(PLATE, 0, 48),
    [-31, 0, 50],
  ],
  WIDTH,
  HEIGHT,
  { pad: 32, azimuth: 45, elevation: 34 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const plan = (x, y, w, d, r = 1.5) => ({ x, y, w, d, r });

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -14, 14, P)}"/>`];
  for (const [x, y] of k.corners(PLATE, 21).sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) {
    out.push(S(k.cylinder(x, y, 7, -14, 1.5, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.2, -12.5, 3.5, P, 28), { tone: "mid" }));
    out.push(L(k.ring(x, y, 1.9, 0, P, 16), { tone: "lo" }));
    out.push(D([at([x, y, 0])], { size: 0.45, tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -9, 9, P, 8, 1.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));

  const ruler = plan(-119, -59, 78, 5, 1);
  out.push(S(k.slabOf(ruler, 0, 0.7, P, 4), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(ruler.x + 3, ruler.x + ruler.w - 3, 4, 5, ruler.y + ruler.d - 0.7, 0.7, [1.2, 2.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));

  const label = plan(77, 48, 38, 10, 1.2);
  out.push(S(k.slabOf(label, 0, 0.9, P, 4, 0.4), { tone: "mid", crease: "none" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4, label.y + 6.5], 0.9, P, "x"), "epoll", { size: 3.1, tone: "lo" }));
  const screws = [[label.x + 2, label.y + 5], [label.x + label.w - 2, label.y + 5]];
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 0.9, 0.9, P, 12)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0.9])), { size: 0.35 }));
  return out.join("");
}

function frame() {
  const out = [];
  for (const x of [-120, 120]) {
    for (const y of [-55, 55]) {
      out.push(S(k.cylinder(x, y, 2.3, 0, 43, P, 20), { tone: "mid", crease: "none" }));
      out.push(S(k.cylinder(x, y, 3.1, 39, 2.5, P, 20), { tone: "hi" }));
    }
  }
  for (const y of [-55, 55]) {
    out.push(S(k.slabOf(plan(-120, y - 2, 240, 4, 1), 42, 3, P, 4, 0.5), { tone: "mid" }));
    out.push(L(k.planOutline(plan(-114, y - 1, 228, 2, 0.5), 45, P, 3), { tone: "faint" }));
  }
  for (const x of [-118, 118]) {
    out.push(S(k.slabOf(plan(x - 2, -54, 4, 108, 1), 33, 3, P, 4, 0.4), { tone: "mid" }));
  }
  out.push(S(k.slabOf(plan(-114, 50, 228, 5, 1.2), 46, 2, P, 4, 0.4), { tone: "hi" }));

  for (const y of [-34, 34]) {
    out.push(S(k.slabOf(plan(37, y - 1, 20, 2, 0.6), 3, 3, P, 3, 0.3), { tone: "mid" }));
    out.push(D([at([40, y, 6]), at([54, y, 6])], { size: 0.38, tone: "lo" }));
  }
  return out.join("");
}

function portsAndBuffers() {
  const out = [];
  ROWS.forEach((y, index) => {
    const fd = [17, 23, 42][index];
    out.push(`<g data-port="${fd}">`);
    out.push(S(k.cylinder(PORT_X, y, 6.8, 0, 9, P, 32, 0.5), { tone: "mid" }));

    out.push(S(k.cylinder(PORT_X, y, 8.4, 9, 2.2, P, 32, 0.4), { tone: "hi" }));
    out.push(L(k.ring(PORT_X, y, 5.1, 11.2, P, 32), { tone: "lo" }));
    out.push(S(k.cylinder(PORT_X, y, 2.2, 11.2, 1.2, P, 20), { tone: "mid" }));
    out.push(L(k.ring(PORT_X, y, 1.2, 12.4, P, 16), { tone: "faint" }));

    const pan = plan(BUFFER_X, y - 7, 27, 14, 1.1);
    out.push(S(k.slabOf(pan, 0.3, 1, P, 4), { tone: "lo", crease: "none" }));
    for (const wall of [
      plan(pan.x, pan.y, pan.w, 1.1, 0.5),
      plan(pan.x, pan.y + pan.d - 1.1, pan.w, 1.1, 0.5),
      plan(pan.x, pan.y + 1, 1.1, pan.d - 2, 0.5),
      plan(pan.x + pan.w - 1.1, pan.y + 1, 1.1, pan.d - 2, 0.5),
    ]) out.push(S(k.slabOf(wall, 1.3, 2, P, 3, 0.25), { tone: "mid" }));

    for (let token = 0; token < 4; token++) {
      const x = -95 + token * 5;
      out.push(`<g data-packet="${fd}:${token}" style="display:none">${S(k.slabOf(plan(x - 1.55, y - 2.4, 3.1, 4.8, 0.7), 1.4, 2.2, P, 3, 0.25), { tone: "hi" })}</g>`);
    }
    const start = at([PORT_X + 6.8, y, 7]);
    const end = at([BUFFER_X, y, 2.4]);
    const via = [at([PORT_X + 8.5, y, 5]), at([BUFFER_X - 1.5, y, 3.4])];
    out.push(k.wireSvg(start, end, { via, tone: "lo", size: 1 }));
    out.push("</g>");
  });
  return out.join("");
}

function registry() {
  const out = [];
  const rack = plan(-63, -37, 56, 74, 2);
  out.push(S(k.slabOf(rack, 0, 3, P, 5, 0.6), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(rack, 3), 3, P, 5), { tone: "faint" }));
  out.push(S(k.slabOf(plan(-62, -36, 2, 72, 0.7), 3, 2, P, 3), { tone: "mid" }));
  out.push(S(k.slabOf(plan(-10, -36, 2, 72, 0.7), 3, 2, P, 3), { tone: "mid" }));

  for (const [a, b] of TREE_LINKS) {
    const from = REG_NODES[a];
    const to = REG_NODES[b];
    out.push(L(k.segment([from.x, from.y, 18], [to.x, to.y, 18], P), { tone: "faint" }));
  }
  for (const node of REG_NODES) {
    out.push(S(k.cylinder(node.x, node.y, 1.8, 3, node.z - 3, P, 18), { tone: "mid", crease: "none" }));
    out.push(S(k.slabOf(plan(node.x - 3.2, node.y - 2.5, 6.4, 5, 1), node.z, 5, P, 3, 0.45), { tone: "hi" }));
    out.push(L(k.planOutline(plan(node.x - 1.8, node.y - 1.3, 3.6, 2.6, 0.5), node.z + 5, P, 3), { tone: "faint" }));
    out.push(D([at([node.x - 2.3, node.y, node.z + 5]), at([node.x + 2.3, node.y, node.z + 5])], { size: 0.35, tone: "lo" }));
  }

  ROWS.forEach((y, index) => {
    const fdLeaf = REG_NODES[index + 3];
    const from = at([fdLeaf.x + 3, y, fdLeaf.z + 3]);
    const to = at([15, y, 9]);
    const via = [at([-43, y, 29]), at([-8, y, 29]), at([15, y, 11])];
    out.push(k.wireSvg(from, to, { via, tone: "lo", size: 1.05 }));
  });
  return out.join("");
}

function readyRail() {
  const out = [];
  const tray = plan(1, -36, 37, 72, 2);
  out.push(S(k.slabOf(tray, 0.5, 1.2, P, 5, 0.4), { tone: "lo" }));
  for (const wall of [plan(1, -36, 37, 2, 0.8), plan(1, 34, 37, 2, 0.8)]) {
    out.push(S(k.slabOf(wall, 1.7, 3, P, 3, 0.4), { tone: "mid" }));
  }
  for (const x of [1, 36]) {
    out.push(S(k.slabOf(plan(x, -34, 2, 68, 0.8), 1.7, 3, P, 3, 0.4), { tone: "mid" }));
  }
  ROWS.forEach((y, index) => {
    const fd = [17, 23, 42][index];
    out.push(S(k.cylinder(15, y, 3.3, 2, 2, P, 24), { tone: "mid" }));
    out.push(L(k.ring(15, y, 2.1, 4, P, 20), { tone: "faint" }));
    const flag = S(k.slabOf(plan(18.7, y - 0.8, 5.5, 1.6, 0.6), 4.2, 1.2, P, 3), { tone: "hi" });
    out.push(`<g class="ready-flag" data-ready-fd="${fd}" style="opacity:.18">${flag}</g>`);
  });
  return out.join("");
}

function eventArray() {
  const out = [];
  const tray = plan(53, -36, 62, 72, 2);
  out.push(S(k.slabOf(tray, 0.5, 1.2, P, 5, 0.4), { tone: "lo" }));
  for (const wall of [plan(53, -36, 62, 2, 0.8), plan(53, 34, 62, 2, 0.8)]) {
    out.push(S(k.slabOf(wall, 1.7, 3, P, 3, 0.4), { tone: "mid" }));
  }
  for (const x of [53, 113]) {
    out.push(S(k.slabOf(plan(x, -34, 2, 68, 0.8), 1.7, 3, P, 3, 0.4), { tone: "mid" }));
  }
  for (const x of [73, 93]) {
    out.push(S(k.slabOf(plan(x, -32, 1.6, 64, 0.7), 1.7, 4, P, 3, 0.3), { tone: "mid" }));
  }
  ROWS.forEach((y, index) => {
    const fd = [17, 23, 42][index];
    out.push(S(k.slabOf(plan(64, y - 7, 18, 14, 1), 2, 0.5, P, 4), { tone: "mid", crease: "none" }));
    out.push(L(k.planOutline(plan(66, y - 5, 14, 10, 0.8), 2.5, P, 3), { tone: "faint" }));
    out.push(`<g data-returned-fd="${fd}" style="opacity:0">${S(k.slabOf(plan(14, y - 3.6, 7, 7.2, 1), 7, 2, P, 4, 0.35), { tone: "hi" })}${S(k.cylinder(17.5, y, 1.2, 9, 1, P, 16), { tone: "mid" })}${D([at([17.5, y, 10])], { size: 0.45, tone: "mid" })}</g>`);
  });
  return out.join("");
}

function waitControl() {
  const out = [];
  out.push(S(k.slabOf(plan(4, -52, 43, 8, 1.5), 0, 2.5, P, 4, 0.5), { tone: "lo" }));
  out.push(L(k.planOutline(plan(8, -50.5, 35, 5, 1), 2.5, P, 3), { tone: "faint" }));
  const handle = [18, -46];
  out.push(S(k.cylinder(handle[0], handle[1], 2.2, 2.5, 7, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(handle[0], handle[1], 3.6, 9.5, 2, P, 24), { tone: "hi" }));
  out.push(L(k.knurl(handle[0], handle[1], 3.6, 9.5, 11.5, 24, P), { tone: "lo" }));
  out.push(S(k.slabOf(plan(21, -47.5, 15, 3, 1), 10, 2, P, 3), { tone: "mid" }));
  out.push(S(k.cylinder(35, -46, 2.8, 10, 3, P, 20), { tone: "hi" }));
  out.push(L(k.ring(35, -46, 1.1, 13, P, 16), { tone: "lo" }));
  return `<g data-wait-lever>${out.join("")}</g>`;
}

function geometry() {
  const out = [base(), frame(), portsAndBuffers(), registry(), readyRail(), eventArray(), waitControl()];
  const svg = k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: "An epoll event-dispatch console: three registered socket buffers connect to a watch index and ready rail. A returned event tag moves to the application event array; payload stays in the socket buffer until read.",
    body: out,
  });
  return svg;
}

const svg = geometry();
const body = k.plateHtml({
  fig: "图 1",
  title: "epoll 事件分拣台",
  hint: "",
  readout: "等待问题",
  keys: [
    { mark: "lit", label: "epoll_wait 返回的连接编号" },
    { mark: "raised", label: "已登记连接与内核暂存的数据" },
    { mark: "dotted", label: "现在可读取的连接" },
  ],
  caption: "服务器可以同时等待许多连接。epoll_wait 告诉程序哪个连接可读；read 才把数据取到程序里。",
  body: `<div class="iso-stage" data-stage tabindex="0" role="group" aria-label="epoll 逐步演示。方向键切换步骤，回车前进一步，Home 回到开头。">${svg}</div>`,
});

const controls = `
<section class="lesson" aria-live="polite" aria-atomic="true">
  <div class="lesson-meta"><span class="lesson-step" data-step-label>第 1 步 / 6</span><span class="lesson-track" data-progress aria-hidden="true"></span></div>
  <h2 data-step-title>问题：很多连接，怎样知道谁有数据？</h2>
  <p data-step-caption>一个服务器会同时保持很多客户端连接。若依次对每个连接调用 read，线程可能停在暂时没有数据的连接上。我们想等到有数据的连接再处理。</p>
</section>
<section class="controls" aria-label="epoll 演示">
  <fieldset class="mode-switch">
    <legend>触发模式</legend>
    <label><input type="radio" name="mode" value="LT" checked><span>LT 水平触发</span></label>
    <label><input type="radio" name="mode" value="ET"><span>ET 边缘触发</span></label>
  </fieldset>
  <div class="fd-picker" role="group" aria-label="选择连接编号">
    <span class="control-label">连接 fd</span>
    <button type="button" data-select-fd="17" aria-pressed="true">17</button>
    <button type="button" data-select-fd="23" aria-pressed="false">23</button>
    <button type="button" data-select-fd="42" aria-pressed="false">42</button>
  </div>
  <div class="step-controls" role="group" aria-label="演示步骤">
    <button type="button" data-step-action="prev" disabled>上一步</button>
    <button type="button" data-step-action="next">下一步</button>
    <button type="button" data-step-action="restart">重播</button>
  </div>
  <output class="event-output" data-events aria-live="polite">等待结果：未调用 epoll_wait</output>
</section>
<a class="theme-link" href="${theme === "light" ? "epoll.html" : "epoll-light.html"}">${theme === "light" ? "深色主题" : "浅色主题"}</a>`;


const CUSTOM_CSS = `
html{color-scheme:${theme === "light" ? "light" : "dark"}}
body[data-theme="dark"]{--anatomy-mid:#858585;--anatomy-lo:#5e5e5e;--anatomy-faint:#404040}
body[data-theme="light"]{--anatomy-mid:#73737a;--anatomy-lo:#939399;--anatomy-faint:#c0c0c5}
.epoll-page{width:min(100%,850px);padding:24px 20px 48px;margin:0 auto}
.iso-stage{touch-action:pan-y;outline:none}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
[data-returned-fd]{transition:opacity 180ms linear}
.ready-flag{transition:opacity 160ms linear}
.lesson{margin:10px 2px 20px;padding:0 0 16px}
.lesson-meta{display:flex;align-items:center;justify-content:space-between;gap:14px}
.lesson-step{color:var(--anatomy-muted);font:12px/1.4 var(--anatomy-mono);font-variant-numeric:tabular-nums}
.lesson-track{display:flex;gap:4px;width:min(34%,190px)}
.lesson-track i{display:block;flex:1;height:3px;background:var(--anatomy-faint)}
.lesson-track i[data-past],.lesson-track i[data-current]{background:var(--anatomy-hi)}
.lesson h2{margin:7px 0 4px;color:var(--anatomy-strong);font-size:17px;font-weight:550;line-height:1.4}
.lesson p{max-width:74ch;margin:0;color:var(--anatomy-text);font-size:14px;line-height:1.7}
.controls{display:flex;align-items:center;flex-wrap:wrap;gap:14px 24px;padding:16px 2px 8px;border-top:1px solid var(--anatomy-faint)}
.mode-switch,.fd-picker,.step-controls{display:flex;align-items:center;gap:6px;margin:0;padding:0;border:0}
.mode-switch legend{float:left;margin-right:8px;color:var(--anatomy-muted);font-size:12px}
.mode-switch label{position:relative;cursor:pointer}
.mode-switch input{position:absolute;opacity:0;inset:0}
.mode-switch span,.fd-picker button,.step-controls button{display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:0 11px;border:1px solid var(--anatomy-faint);border-radius:4px;background:var(--anatomy-card);color:var(--anatomy-text);font:inherit;white-space:nowrap;cursor:pointer}
.mode-switch input:checked+span,.fd-picker button[aria-pressed=true]{border-color:var(--anatomy-mid);color:var(--anatomy-strong);box-shadow:inset 0 -2px 0 var(--anatomy-hi)}
.mode-switch input:focus-visible+span,.fd-picker button:focus-visible,.step-controls button:focus-visible{outline:2px solid var(--anatomy-muted);outline-offset:2px}
.fd-picker button{min-width:42px;font-family:var(--anatomy-mono);font-variant-numeric:tabular-nums}
.step-controls button[data-step-action=next]{color:var(--anatomy-strong);border-color:var(--anatomy-mid)}
.step-controls button:disabled{opacity:.4;cursor:default}
.step-controls button:not(:disabled):hover,.fd-picker button:hover,.mode-switch label:hover span{background:var(--anatomy-face)}
.control-label{color:var(--anatomy-muted);font-size:12px}
.event-output{flex:1 1 100%;min-height:22px;color:var(--anatomy-muted);font:12px/1.5 var(--anatomy-mono)}
.theme-link{display:inline-block;margin-top:12px;color:var(--anatomy-muted);font-size:12px;text-decoration-thickness:1px;text-underline-offset:3px}
.theme-link:hover{color:var(--anatomy-strong)}
@media(max-width:620px){.epoll-page{padding:16px 12px 32px}.controls{gap:12px}.mode-switch,.fd-picker,.step-controls{flex-wrap:wrap}.step-controls button{flex:1}}
@media(prefers-reduced-motion:reduce){[data-returned-fd],.ready-flag{transition:none}}
`;

const modelSource = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");
const modelInline = `const MODEL = (() => { ${modelSource}\nreturn { FDS, ARRIVAL_BYTES, READ_BYTES, MAX_BYTES, DEMO_LAST_STEP, createState, selectFd, setMode, addData, waitEvents, readData, readyFds, channelFor, demoState }; })();`;
const live = `
${modelInline}
const stage = document.querySelector("[data-stage]");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const eventOutput = document.querySelector("[data-events]");
const controls = document.querySelector(".controls");
const stepLabel = document.querySelector("[data-step-label]");
const stepTitle = document.querySelector("[data-step-title]");
const stepCaption = document.querySelector("[data-step-caption]");
const progress = document.querySelector("[data-progress]");
const previousButton = controls.querySelector('[data-step-action="prev"]');
const nextButton = controls.querySelector('[data-step-action="next"]');
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const tagX = new Map(MODEL.FDS.map((fd) => [fd, 0]));
let mode = "LT", selectedFd = MODEL.FDS[0], step = 0;
let state = MODEL.demoState(mode, selectedFd, step);
let frame = 0, last = 0, visible = false, lever = 0, leverTarget = 0;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const copyForStep = () => {
  const fd = selectedFd;
  if (step === 0) return ["问题：很多连接，怎样知道谁有数据？", "最简单的办法是逐个等客户端发消息。但如果先等的客户端一直没发，线程就卡在那里，其他已经有消息的连接也得等。"];
  if (step === 1) return ["先登记要关注的连接", "fd（文件描述符）是程序里引用连接的编号，例如 17、23、42。epoll_ctl 是登记操作：把要关注的连接编号加入 epoll 的名单。这一步不读取数据。"];
  if (step === 2) return ["一个连接收到数据", "fd " + fd + " 收到 2 KB。数据先放在内核的接收缓冲区（暂存网络数据的地方）。内核把现在有数据可读的连接记到就绪队列。"];
  if (step === 3) return ["epoll_wait 告诉程序该处理谁", "epoll_wait 返回 fd " + fd + "，表示这个连接现在可读。它只报告连接编号，不会把 2 KB 数据读到程序自己的缓冲区里。"];
  if (step === 4) return ["read 才真正取走数据", "程序对 fd " + fd + " 调用 read，取走 1 KB；内核接收缓冲区里还剩 1 KB。通知和读取是两件事。"];
  if (mode === "LT") return ["LT：没读完，下次还会提醒", "LT（水平触发）看当前状态：缓冲区还剩 1 KB，所以再次调用 epoll_wait，仍会返回 fd " + fd + "。"];
  return ["ET：读了一部分，这次不会再提醒", "ET（边缘触发）提醒“从没数据变成有数据”。读走 1 KB 后还剩 1 KB，但这次变化已经通知过，所以再次等待返回空。实际使用时通常设为非阻塞，并一直读取到 EAGAIN（暂时读空）。"];
};
function eventText() {
  if (step < 3) return "等待结果：尚未调用 epoll_wait";
  if (step < 5) return "最近一次返回：fd " + selectedFd;
  return state.returned.length ? "本次返回：fd " + selectedFd : "本次返回：无就绪连接";
}
function readoutText() {
  if (step === 0) return "等待多个连接";
  if (step === 1) return "已登记 3 个连接";
  if (step === 2) return "fd " + selectedFd + " · 2 KB 到达";
  if (step === 3) return "已通知 fd " + selectedFd;
  if (step === 4) return "read 后剩 1 KB";
  return mode === "LT" ? "LT · 再次返回 fd " + selectedFd : "ET · 本次无通知";
}
function render() {
  state = MODEL.demoState(mode, selectedFd, step);
  const [title, caption] = copyForStep();
  readout.textContent = readoutText();
  eventOutput.textContent = eventText();
  stepLabel.textContent = "第 " + (step + 1) + " 步 / " + (MODEL.DEMO_LAST_STEP + 1);
  stepTitle.textContent = title;
  stepCaption.textContent = caption;
  previousButton.disabled = step === 0;
  nextButton.disabled = step === MODEL.DEMO_LAST_STEP;
  progress.querySelectorAll("i").forEach((bar, index) => {
    bar.toggleAttribute("data-past", index < step);
    bar.toggleAttribute("data-current", index === step);
  });
  controls.querySelectorAll("[data-select-fd]").forEach((button) => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.selectFd) === selectedFd));
  });
  controls.querySelectorAll('[name="mode"]').forEach((input) => { input.checked = input.value === mode; });
  for (const channel of state.channels) {
    const packets = Math.ceil(channel.bytes / 1024);
    svg.querySelectorAll("[data-packet]").forEach((packet) => {
      const [fd, index] = packet.dataset.packet.split(":").map(Number);
      if (fd === channel.fd) packet.style.display = index < packets ? "" : "none";
    });
    svg.querySelector('[data-ready-fd="' + channel.fd + '"]').style.opacity = channel.ready ? "1" : ".18";
    const tag = svg.querySelector('[data-returned-fd="' + channel.fd + '"]');
    const selected = channel.fd === selectedFd && state.returned.includes(channel.fd);
    tag.querySelectorAll(".iso-solid").forEach((part) => part.toggleAttribute("data-lit", selected));
    tag.style.opacity = state.returned.includes(channel.fd) ? "1" : "0";
  }
}
function run() {
  if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); }
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const ease = reduced.matches ? 1 : 1 - Math.exp(-dt / 0.32);
  let moving = false;
  for (const fd of MODEL.FDS) {
    const target = state.returned.includes(fd) ? 1 : 0;
    let value = tagX.get(fd);
    value = reduced.matches ? target : value + (target - value) * ease;
    if (Math.abs(value - target) < 0.001) value = target;
    tagX.set(fd, value);
    svg.querySelector('[data-returned-fd="' + fd + '"]').setAttribute("transform", translateAlong(${JSON.stringify(P)}, [59 * value, 0, 0]));
    moving ||= value !== target;
  }
  lever += (leverTarget - lever) * (reduced.matches ? 1 : 1 - Math.exp(-dt / 0.09));
  if (Math.abs(lever - leverTarget) < 0.005) lever = leverTarget;
  svg.querySelector("[data-wait-lever]").setAttribute("transform", translateAlong(${JSON.stringify(P)}, [0, 0, lever * 2.5]));
  moving ||= lever !== leverTarget;
  frame = visible && moving ? requestAnimationFrame(tick) : 0;
}
function pulseLever() {
  leverTarget = 1;
  run();
  setTimeout(() => { leverTarget = 0; run(); }, 180);
}
function setStep(next) {
  const previous = step;
  step = clamp(next, 0, MODEL.DEMO_LAST_STEP);
  render();
  if (step !== previous && (step === 3 || step === 5)) pulseLever();
  run();
}
function selectFd(fd) {
  selectedFd = fd;
  render();
  run();
}
controls.addEventListener("click", (event) => {
  const fdButton = event.target.closest("[data-select-fd]");
  if (fdButton) return selectFd(Number(fdButton.dataset.selectFd));
  const stepButton = event.target.closest("[data-step-action]");
  if (!stepButton) return;
  const action = stepButton.dataset.stepAction;
  if (action === "prev") setStep(step - 1);
  else if (action === "next") setStep(step + 1);
  else setStep(0);
});
controls.addEventListener("change", (event) => {
  if (event.target.name !== "mode") return;
  mode = event.target.value;
  setStep(0);
});
stage.addEventListener("click", (event) => {
  const port = event.target.closest("[data-port]");
  if (port) selectFd(Number(port.dataset.port));
});
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "Enter") { event.preventDefault(); setStep(step + 1); }
  else if (event.key === "ArrowLeft") { event.preventDefault(); setStep(step - 1); }
  else if (event.key === "Home") { event.preventDefault(); setStep(0); }
});
progress.innerHTML = Array.from({ length: MODEL.DEMO_LAST_STEP + 1 }, () => "<i></i>").join("");
new IntersectionObserver((entries) => {
  visible = entries[entries.length - 1].isIntersecting;
  if (visible) run();
}, { rootMargin: "120px 0px" }).observe(stage);
render();
`;

const html = k.pageHtml({ title: "epoll 事件分拣台", theme, body: `<div class="epoll-page">${body}${controls}</div>`, script: kitScript() + live, width: 850 })
  .replace("<html lang=\"en\">", "<html lang=\"zh-CN\">")
  .replace("</head>", `<style>${CUSTOM_CSS}</style></head>`);
const output = join(HERE, theme === "light" ? "epoll-light.html" : "epoll.html");
writeFileSync(output, html);
console.log("wrote", output);
