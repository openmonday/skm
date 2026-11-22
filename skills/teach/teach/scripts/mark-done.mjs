#!/usr/bin/env node
// Mark one roadmap lesson done.
// Usage: node mark-done.mjs <roadmap.json> <slug>
// Changes only that entry's status; exits 1 when the slug is unknown or its
// lesson file (<topic>/<slug>/<slug>.md) does not exist.
import fs from "node:fs";
import path from "node:path";

const [file, slug] = process.argv.slice(2);
if (!file || !slug) {
  console.error("usage: node mark-done.mjs <roadmap.json> <slug>");
  process.exit(2);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (err) {
  console.error(`${file}: ${err.message}`);
  process.exit(1);
}

const lessons = Array.isArray(data?.lessons) ? data.lessons : [];
const entry = lessons.find((lesson) => lesson?.slug === slug);
if (!entry) {
  const planned = lessons.filter((l) => l?.status === "planned").map((l) => l.slug);
  console.error(`${file}: no lesson "${slug}". Planned: ${planned.join(", ") || "none"}`);
  process.exit(1);
}

const lessonFile = path.join(path.dirname(path.resolve(file)), slug, `${slug}.md`);
if (!fs.existsSync(lessonFile)) {
  console.error(`${file}: ${slug}/${slug}.md does not exist; write the lesson first`);
  process.exit(1);
}

entry.status = "done";
fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
const done = lessons.filter((l) => l?.status === "done").length;
console.log(`${file}: ${slug} done (${done}/${lessons.length})`);
