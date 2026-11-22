#!/usr/bin/env node
// Validate a .lessons/<topic>/roadmap.json file.
// Usage: node check-roadmap.mjs <roadmap.json>
// Exits 1 and prints one line per problem when the roadmap is invalid.
import fs from "node:fs";
import path from "node:path";

const STATUSES = new Set(["planned", "done", "skipped"]);
const FIELDS = new Set(["slug", "title", "objective", "requires", "status"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function checkRoadmap(data, topicDir) {
  const problems = [];
  const text = (value) => typeof value === "string" && value.trim() !== "";

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["roadmap must be a JSON object"];
  }
  if (!text(data.title)) problems.push("title must be a non-empty string");
  if (!text(data.goal)) problems.push("goal must be a non-empty string");
  if (!Array.isArray(data.lessons) || data.lessons.length === 0) {
    problems.push("lessons must be a non-empty array");
    return problems;
  }

  const seen = new Set();
  data.lessons.forEach((lesson, i) => {
    const at = `lessons[${i}]`;
    if (!lesson || typeof lesson !== "object" || Array.isArray(lesson)) {
      problems.push(`${at} must be an object`);
      return;
    }
    const name = text(lesson.slug) ? `${at} (${lesson.slug})` : at;
    for (const key of Object.keys(lesson)) {
      if (!FIELDS.has(key)) problems.push(`${name}: unknown field "${key}"`);
    }
    if (!text(lesson.slug) || !SLUG.test(lesson.slug)) {
      problems.push(`${name}: slug must be kebab-case`);
    } else if (seen.has(lesson.slug)) {
      problems.push(`${name}: duplicate slug`);
    }
    if (!text(lesson.title)) problems.push(`${name}: title must be a non-empty string`);
    if (!text(lesson.objective)) problems.push(`${name}: objective must be a non-empty string`);
    if (!STATUSES.has(lesson.status)) {
      problems.push(`${name}: status must be planned, done, or skipped`);
    }
    if (!Array.isArray(lesson.requires)) {
      problems.push(`${name}: requires must be an array of slugs`);
    } else {
      for (const req of lesson.requires) {
        if (req === lesson.slug) problems.push(`${name}: requires itself`);
        else if (!seen.has(req)) problems.push(`${name}: requires "${req}", which is not an earlier lesson`);
      }
    }
    if (lesson.status === "done" && text(lesson.slug) && topicDir) {
      const file = path.join(topicDir, lesson.slug, `${lesson.slug}.md`);
      if (!fs.existsSync(file)) problems.push(`${name}: done, but ${lesson.slug}/${lesson.slug}.md is missing`);
    }
    if (text(lesson.slug)) seen.add(lesson.slug);
  });
  return problems;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: node check-roadmap.mjs <roadmap.json>");
    process.exit(2);
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    console.error(`${file}: ${err.message}`);
    process.exit(1);
  }
  const problems = checkRoadmap(data, path.dirname(path.resolve(file)));
  if (problems.length) {
    for (const p of problems) console.error(`${file}: ${p}`);
    process.exit(1);
  }
  const done = data.lessons.filter((l) => l.status === "done").length;
  console.log(`${file}: ok, ${done}/${data.lessons.length} done`);
}
