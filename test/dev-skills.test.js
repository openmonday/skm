import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const dev = resolve('skills/dev');
const cli = resolve('src/cli.js');

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

test('each dev skill copied alone has self-contained Markdown links', () => {
  const temp = realpathSync(mkdtempSync(join(tmpdir(), 'dev-skills-')));
  try {
    const skills = readdirSync(dev, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && existsSync(join(dev, entry.name, 'SKILL.md')));
    for (const skill of skills) {
      const project = join(temp, skill.name);
      mkdirSync(project);
      const env = { ...process.env };
      delete env.SKM_HOME;
      delete env.SKM_TARGET_DIR;
      execFileSync(process.execPath, [cli, 'add', skill.name, '--copy'], { cwd: project, env });
      const copied = join(project, '.agents/skills', skill.name);
      for (const file of files(copied).filter(path => path.endsWith('.md'))) {
        const text = readFileSync(file, 'utf8');
        for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
          const link = match[1].split('#')[0];
          if (!link || /^[a-z][a-z\d+.-]*:/i.test(link)) continue;
          assert.ok(!isAbsolute(link), `${file}: absolute link ${link}`);
          const target = resolve(dirname(file), decodeURIComponent(link));
          const within = relative(copied, target);
          assert.ok(within !== '..' && !within.startsWith(`..${sep}`) && !isAbsolute(within), `${file}: link escapes skill: ${link}`);
          assert.ok(existsSync(target), `${file}: missing ${link}`);
        }
      }
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('shared dev skill references match their canonical copies', () => {
  const canonicals = {
    'ARCH-RECORDS.md': 'guidelines/ARCH-RECORDS.md',
    'VOCABULARY.md': 'codebase-design/VOCABULARY.md',
    'TASKS.md': 'to-tasks/TASKS.md',
  };
  for (const [name, canonical] of Object.entries(canonicals)) {
    const expected = readFileSync(join(dev, canonical), 'utf8');
    for (const file of files(dev).filter(path => path.endsWith(`${sep}${name}`))) {
      assert.equal(readFileSync(file, 'utf8'), expected, `${file} differs from ${canonical}`);
    }
  }
});
