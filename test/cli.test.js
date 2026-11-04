import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { getConfig } from '../src/config.js';

const execFileAsync = promisify(execFile);
const repository = fileURLToPath(new URL('..', import.meta.url));
const cli = path.join(repository, 'src', 'cli.js');
const bundledSkills = path.join(repository, 'skills');

async function workspace(t) {
  const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'skm-cli-')));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const home = path.join(root, 'repository');
  const project = path.join(root, 'project');
  await fs.mkdir(project);
  return { root, home, project };
}

async function createSkill(root, relativePath) {
  const directory = path.join(root, relativePath);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'SKILL.md'), `# ${path.basename(relativePath)}\n`);
  return directory;
}

async function fixture(t) {
  const data = await workspace(t);
  data.alpha = await createSkill(data.home, 'engineering/alpha');
  data.beta = await createSkill(data.home, 'productivity/beta');
  data.groups = { engineering: ['alpha'], productivity: ['beta'], core: ['alpha', 'beta'] };
  await fs.writeFile(path.join(data.home, 'groups.json'), JSON.stringify({ groups: data.groups }));
  return data;
}

async function run(args, data, { useDefault = false } = {}) {
  const env = { ...process.env };
  delete env.SKM_HOME;
  delete env.SKM_TARGET_DIR;
  if (!useDefault) env.SKM_HOME = data.home;
  return execFileAsync(process.execPath, [cli, ...args], { cwd: data.project, env });
}

function target(data, name = '') {
  return path.join(data.project, '.agents', 'skills', name);
}

async function assertLink(link, source) {
  assert.equal((await fs.lstat(link)).isSymbolicLink(), true);
  const destination = await fs.readlink(link);
  assert.equal(path.resolve(path.dirname(link), destination), source);
}

async function assertMissing(file) {
  await assert.rejects(fs.lstat(file), { code: 'ENOENT' });
}

async function snapshot(root) {
  const entries = [];
  async function visit(directory) {
    for (const name of (await fs.readdir(directory)).sort()) {
      const absolute = path.join(directory, name);
      const relative = path.relative(root, absolute);
      const stat = await fs.lstat(absolute);
      if (stat.isSymbolicLink()) entries.push([relative, 'link', await fs.readlink(absolute)]);
      else if (stat.isDirectory()) {
        entries.push([relative, 'directory']);
        await visit(absolute);
      } else entries.push([relative, 'file', (await fs.readFile(absolute)).toString('base64')]);
    }
  }
  await visit(root);
  return entries;
}

async function expectFailure(args, data, check) {
  await assert.rejects(() => run(args, data), (error) => {
    assert.equal(error.code, 1);
    assert.equal(error.stdout, '');
    assert.match(error.stderr, /error/i);
    check(error.stderr);
    return true;
  });
}

test('config defaults to bundled skills relative to the module and uses SKM_HOME as the root', () => {
  const cwd = path.join(os.tmpdir(), 'skm-unrelated-project');
  const defaults = getConfig(cwd, {});
  assert.equal(defaults.home, bundledSkills);
  assert.equal(defaults.skillsDir, bundledSkills);
  assert.equal(defaults.groupsFile, path.join(bundledSkills, 'groups.json'));
  assert.equal(defaults.targetDir, path.join(cwd, '.agents', 'skills'));
  const customHome = path.join(os.tmpdir(), 'skm-custom-root');
  const custom = getConfig(cwd, { SKM_HOME: customHome });
  assert.equal(custom.home, customHome);
  assert.equal(custom.skillsDir, customHome);
  assert.equal(custom.groupsFile, path.join(customHome, 'groups.json'));
  for (const config of [defaults, custom]) {
    assert.equal(Object.hasOwn(config, 'sourcesFile'), false);
    assert.equal(Object.hasOwn(config, 'cacheDir'), false);
  }
});

test('init creates only the repository root and empty groups.json', async (t) => {
  const data = await workspace(t);
  const { stdout, stderr } = await run(['init'], data);
  assert.match(stdout, /initialized/i);
  assert.equal(stderr, '');
  assert.deepEqual(await fs.readdir(data.home), ['groups.json']);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(data.home, 'groups.json'), 'utf8')), { groups: {} });
  await assertMissing(target(data));
});

test('init infers category groups from all descendant skills without descending into skills', async (t) => {
  const data = await workspace(t);
  await createSkill(data.home, 'engineering/alpha');
  await createSkill(data.home, 'engineering/languages/javascript/gamma');
  await createSkill(data.home, 'engineering/alpha/examples/embedded');
  await createSkill(data.home, 'productivity/beta');
  await createSkill(data.home, '.hidden/secret');
  await createSkill(data.home, 'engineering/.private/internal');
  await fs.mkdir(path.join(data.home, 'empty-category'), { recursive: true });
  await fs.writeFile(path.join(data.home, 'engineering', 'README.md'), '# category\n');

  await run(['init'], data);
  const { groups } = JSON.parse(await fs.readFile(path.join(data.home, 'groups.json'), 'utf8'));
  assert.deepEqual([...groups.engineering].sort(), ['alpha', 'gamma']);
  assert.deepEqual(groups.productivity, ['beta']);
  assert.equal(Object.hasOwn(groups, '.hidden'), false);
  assert.equal(Object.values(groups).flat().some((name) => ['embedded', 'secret', 'internal'].includes(name)), false);
  await assertMissing(path.join(data.home, 'sources.json'));
  await assertMissing(path.join(data.home, 'cache'));
  await assertMissing(path.join(data.home, 'skills'));
});

test('init preserves existing groups byte for byte, including cross-category and custom groups', async (t) => {
  const data = await fixture(t);
  const contents = '{\n  "groups": {\n    "engineering": ["beta", "alpha"],\n    "productivity": ["alpha"],\n    "custom": ["alpha", "beta"]\n  }\n}\n\n';
  await fs.writeFile(path.join(data.home, 'groups.json'), contents);
  const before = await snapshot(data.home);
  await run(['init'], data);
  await run(['init'], data);
  assert.equal(await fs.readFile(path.join(data.home, 'groups.json'), 'utf8'), contents);
  assert.deepEqual(await snapshot(data.home), before);
  const { stdout } = await run(['list', '--json'], data);
  assert.deepEqual(JSON.parse(stdout).groups, JSON.parse(contents).groups);
});

test('add installs short names from categorized roots into flat project-local links', async (t) => {
  const data = await fixture(t);
  const before = await snapshot(data.home);
  const { stdout, stderr } = await run(['add', 'alpha', 'beta'], data);
  assert.match(stdout, /linked alpha/);
  assert.match(stdout, /linked beta/);
  assert.equal(stderr, '');
  assert.deepEqual((await fs.readdir(target(data))).sort(), ['alpha', 'beta']);
  await assertLink(target(data, 'alpha'), data.alpha);
  await assertLink(target(data, 'beta'), data.beta);
  assert.deepEqual(await snapshot(data.home), before);
});

test('list reports categorized skills, custom groups, and installed status as JSON and text', async (t) => {
  const data = await fixture(t);
  await run(['add', 'alpha'], data);
  const { stdout, stderr } = await run(['list', '--json'], data);
  assert.equal(stderr, '');
  const result = JSON.parse(stdout);
  assert.equal(result.repository, data.home);
  assert.equal(result.target, target(data));
  assert.deepEqual(result.skills, [
    { name: 'alpha', installed: true },
    { name: 'beta', installed: false },
  ]);
  assert.deepEqual(result.groups, data.groups);
  const text = await run(['list'], data);
  assert.match(text.stdout, /Repository\s+/);
  assert.ok(text.stdout.includes(data.home));
  assert.match(text.stdout, /●\s+alpha\s+installed/);
  assert.match(text.stdout, /engineering:\s+alpha/);
  assert.match(text.stdout, /productivity:\s+beta/);
  assert.match(text.stdout, /core:\s+alpha, beta/);
});

for (const args of [['--group', 'core'], ['--group=core'], ['@core']]) {
  test(`add accepts group syntax ${args.join(' ')}`, async (t) => {
    const data = await fixture(t);
    const result = await run(['add', ...args], data);
    assert.equal(result.stderr, '');
    await assertLink(target(data, 'alpha'), data.alpha);
    await assertLink(target(data, 'beta'), data.beta);
  });
}

test('overlapping groups and explicit repeats warn with origins and install each skill once', async (t) => {
  const data = await fixture(t);
  const { stdout, stderr } = await run(['add', '@core', '--group', 'engineering', 'alpha', 'alpha'], data);
  assert.match(stderr, /warn|duplicate|overlap|repeat/i);
  assert.match(stderr, /alpha/);
  assert.match(stderr, /core/);
  assert.match(stderr, /engineering/);
  assert.match(stderr, /explicit|argument|direct|command/i);
  assert.equal(stdout.split('\n').filter((line) => /\balpha\b/.test(line)).length, 1);
  assert.equal(stdout.split('\n').filter((line) => /\bbeta\b/.test(line)).length, 1);
  assert.deepEqual((await fs.readdir(target(data))).sort(), ['alpha', 'beta']);
  await assertLink(target(data, 'alpha'), data.alpha);
  await assertLink(target(data, 'beta'), data.beta);
});

test('re-adding already linked skills in a separate invocation prints normal output without warnings', async (t) => {
  const data = await fixture(t);
  await run(['add', '@core'], data);
  const before = await snapshot(data.root);
  const { stdout, stderr } = await run(['add', '@core'], data);
  assert.match(stdout, /already linked alpha/);
  assert.match(stdout, /already linked beta/);
  assert.equal(stderr, '');
  assert.deepEqual(await snapshot(data.root), before);
});

test('duplicate actual skill basenames report both source paths before any target mutation', async (t) => {
  const data = await fixture(t);
  const duplicate = await createSkill(data.home, 'productivity/nested/alpha');
  const check = (stderr) => {
    assert.match(stderr, /duplicate|ambiguous/i);
    assert.match(stderr, /alpha/);
    assert.ok(stderr.includes(data.alpha), stderr);
    assert.ok(stderr.includes(duplicate), stderr);
  };
  const pristine = await snapshot(data.root);
  await expectFailure(['add', 'beta'], data, check);
  assert.deepEqual(await snapshot(data.root), pristine);
  await assertMissing(target(data));

  await fs.mkdir(target(data), { recursive: true });
  await fs.symlink(data.beta, target(data, 'beta'), 'dir');
  await fs.writeFile(path.join(target(data), 'keep.txt'), 'keep this target content\n');
  const existing = await snapshot(data.root);
  await expectFailure(['add', '@core'], data, check);
  assert.deepEqual(await snapshot(data.root), existing);
  await expectFailure(['list', '--json'], data, check);
});

test('discovery requires an actual SKILL.md file and stops descending once a skill is found', async (t) => {
  const data = await fixture(t);
  const gamma = await createSkill(data.home, 'engineering/languages/deep/gamma');
  await fs.mkdir(path.join(data.home, 'engineering', 'plain-folder'), { recursive: true });
  await fs.writeFile(path.join(data.home, 'engineering', 'plain-folder', 'README.md'), '# not a skill\n');
  await fs.mkdir(path.join(data.home, 'engineering', 'directory-marker', 'SKILL.md'), { recursive: true });
  await fs.writeFile(path.join(data.home, 'engineering', 'loose-file'), '# not a directory\n');
  await createSkill(data.alpha, 'examples/beta');
  await createSkill(data.beta, 'nested/ignored-inner');
  const { stdout } = await run(['list', '--json'], data);
  assert.deepEqual(JSON.parse(stdout).skills.map(({ name }) => name), ['alpha', 'beta', 'gamma']);
  await run(['add', 'gamma'], data);
  await assertLink(target(data, 'gamma'), gamma);
  await expectFailure(['add', 'plain-folder'], data, (stderr) => {
    assert.match(stderr, /plain-folder/);
    assert.match(stderr, /not found|unknown/i);
  });
});

test('hidden directories at every level are ignored, including duplicate skill names', async (t) => {
  const data = await fixture(t);
  await createSkill(data.home, '.hidden/alpha');
  await createSkill(data.home, '.hidden/hidden-only');
  await createSkill(data.home, 'engineering/.cache/beta');
  await createSkill(data.home, 'engineering/.private');
  const { stdout } = await run(['list', '--json'], data);
  assert.deepEqual(JSON.parse(stdout).skills.map(({ name }) => name), ['alpha', 'beta']);
  await run(['add', '@core'], data);
  assert.deepEqual((await fs.readdir(target(data))).sort(), ['alpha', 'beta']);
});

test('discovery and installation support symlinked skill directories when available', async (t) => {
  const data = await fixture(t);
  const external = await createSkill(data.root, 'external/gamma');
  const linkedSource = path.join(data.home, 'engineering', 'gamma');
  try {
    await fs.symlink(external, linkedSource, 'dir');
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOSYS', 'ENOTSUP'].includes(error.code)) {
      t.skip(`Directory symlinks unavailable: ${error.code}`);
      return;
    }
    throw error;
  }
  const { stdout } = await run(['list', '--json'], data);
  assert.deepEqual(JSON.parse(stdout).skills.map(({ name }) => name), ['alpha', 'beta', 'gamma']);
  await run(['add', 'gamma'], data);
  assert.equal((await fs.lstat(target(data, 'gamma'))).isSymbolicLink(), true);
  assert.equal(await fs.realpath(target(data, 'gamma')), external);
  const installed = await run(['list', '--json'], data);
  assert.equal(JSON.parse(installed.stdout).skills.find(({ name }) => name === 'gamma').installed, true);
});

for (const [label, contents, detail] of [
  ['malformed JSON', '{ broken', /json|parse|unexpected|property/i],
  ['null groups', '{"groups":null}', /groups|object/i],
  ['array groups', '{"groups":[]}', /groups|object/i],
  ['non-array members', '{"groups":{"broken":"alpha"}}', /broken|array/i],
  ['non-string members', '{"groups":{"broken":[42]}}', /broken|skill names|string/i],
]) {
  test(`invalid groups fail with a useful error: ${label}`, async (t) => {
    const data = await fixture(t);
    const groupsFile = path.join(data.home, 'groups.json');
    await fs.writeFile(groupsFile, contents);
    const before = await snapshot(data.root);
    await expectFailure(['list', '--json'], data, (stderr) => {
      assert.match(stderr, /invalid|groups/i);
      assert.match(stderr, detail);
    });
    await expectFailure(['add', 'alpha'], data, (stderr) => {
      assert.match(stderr, detail);
    });
    assert.deepEqual(await snapshot(data.root), before);
    assert.equal(await fs.readFile(groupsFile, 'utf8'), contents);
  });
}

test('unknown groups and missing group members fail before installing any selected skills', async (t) => {
  const data = await fixture(t);
  await expectFailure(['add', 'alpha', '@missing-group'], data, (stderr) => {
    assert.match(stderr, /missing-group/);
    assert.match(stderr, /not found|unknown/i);
  });
  await assertMissing(target(data));
  await fs.writeFile(path.join(data.home, 'groups.json'), '{"groups":{"broken":["alpha","missing-skill"]}}');
  await expectFailure(['add', '@broken'], data, (stderr) => {
    assert.match(stderr, /missing-skill/);
    assert.match(stderr, /not found|unknown/i);
  });
  await assertMissing(target(data));
});

test('list does not report a same-name link with the wrong target as installed', async (t) => {
  const data = await fixture(t);
  await fs.mkdir(target(data), { recursive: true });
  await fs.symlink(path.join(data.root, 'not-the-local-alpha'), target(data, 'alpha'), 'dir');
  const { stdout } = await run(['list', '--json'], data);
  assert.equal(JSON.parse(stdout).skills.find(({ name }) => name === 'alpha').installed, false);
  const result = await run(['add', 'alpha'], data);
  assert.match(result.stdout, /updated alpha/);
  assert.equal(result.stderr, '');
  await assertLink(target(data, 'alpha'), data.alpha);
});

test('relative links to the correct skill are recognized and retained', async (t) => {
  const data = await fixture(t);
  await fs.mkdir(target(data), { recursive: true });
  const relative = path.relative(target(data), data.alpha);
  await fs.symlink(relative, target(data, 'alpha'), 'dir');
  const { stdout } = await run(['list', '--json'], data);
  assert.equal(JSON.parse(stdout).skills.find(({ name }) => name === 'alpha').installed, true);
  const result = await run(['add', 'alpha'], data);
  assert.match(result.stdout, /already linked alpha/);
  assert.equal(result.stderr, '');
  assert.equal(await fs.readlink(target(data, 'alpha')), relative);
});

for (const kind of ['directory', 'file']) {
  test(`add does not overwrite a real project ${kind} or partially install its group`, async (t) => {
    const data = await fixture(t);
    await fs.mkdir(target(data), { recursive: true });
    if (kind === 'directory') {
      await fs.mkdir(target(data, 'beta'));
      await fs.writeFile(path.join(target(data, 'beta'), 'keep.txt'), 'keep\n');
    } else await fs.writeFile(target(data, 'beta'), 'keep\n');
    const before = await snapshot(data.root);
    await expectFailure(['add', '@core'], data, (stderr) => {
      assert.match(stderr, /beta/);
      assert.match(stderr, /already exists and is not a symlink/);
    });
    assert.deepEqual(await snapshot(data.root), before);
    await assertMissing(target(data, 'alpha'));
  });
}

test('sources metadata is ignored and removed update commands cannot modify local state', async (t) => {
  const data = await fixture(t);
  await fs.writeFile(path.join(data.home, 'sources.json'), 'invalid removed source metadata\n');
  const { stdout } = await run(['list', '--json'], data);
  assert.deepEqual(JSON.parse(stdout).skills.map(({ name }) => name), ['alpha', 'beta']);
  await run(['add', 'alpha'], data);
  const before = await snapshot(data.root);
  for (const args of [['update'], ['update', '--force']]) {
    await expectFailure(args, data, (stderr) => {
      assert.match(stderr, /unknown command.*update/i);
    });
    assert.deepEqual(await snapshot(data.root), before);
  }
  const help = await run(['--help'], data);
  assert.doesNotMatch(help.stdout, /skm update|~\/\.skm|sources\.json|cache/i);
  await assertMissing(path.join(data.home, 'cache'));
});

for (const args of [['alpha', '--copy'], ['--copy', '--group', 'core'], ['@core', '--copy']]) {
  test(`copy installation supports ${args.join(' ')}`, async (t) => {
    const data = await fixture(t);
    await fs.mkdir(path.join(data.alpha, 'references'));
    await fs.writeFile(path.join(data.alpha, 'references', 'guide.md'), 'supporting content\n');
    const before = await snapshot(data.home);
    const result = await run(['add', ...args], data);
    assert.equal(result.stderr, '');
    assert.match(result.stdout, /copied alpha/);
    assert.equal((await fs.lstat(target(data, 'alpha'))).isSymbolicLink(), false);
    assert.deepEqual(await snapshot(target(data, 'alpha')), await snapshot(data.alpha));
    if (args.includes('core') || args.includes('@core')) {
      assert.deepEqual(await snapshot(target(data, 'beta')), await snapshot(data.beta));
    }
    assert.deepEqual(await snapshot(data.home), before);
    await fs.writeFile(path.join(data.alpha, 'SKILL.md'), 'changed source\n');
    assert.equal(await fs.readFile(path.join(target(data, 'alpha'), 'SKILL.md'), 'utf8'), '# alpha\n');
    const installed = JSON.parse((await run(['list', '--json'], data)).stdout);
    assert.equal(installed.skills.find(({ name }) => name === 'alpha').installed, true);
  });
}

test('copy mode replaces an existing link without changing its source', async (t) => {
  const data = await fixture(t);
  await run(['add', 'alpha'], data);
  const before = await snapshot(data.home);
  await run(['add', 'alpha', '--copy'], data);
  assert.equal((await fs.lstat(target(data, 'alpha'))).isDirectory(), true);
  assert.deepEqual(await snapshot(target(data, 'alpha')), await snapshot(data.alpha));
  assert.deepEqual(await snapshot(data.home), before);
});

for (const kind of ['directory', 'file']) {
  test(`copy mode preserves existing ${kind} and does not partially install a group`, async (t) => {
    const data = await fixture(t);
    await fs.mkdir(target(data), { recursive: true });
    if (kind === 'directory') await fs.mkdir(target(data, 'beta'));
    else await fs.writeFile(target(data, 'beta'), 'keep\n');
    const before = await snapshot(data.root);
    await expectFailure(['add', '--copy', '@core'], data, (stderr) => {
      assert.match(stderr, /beta.*already exists and is not a symlink/);
    });
    assert.deepEqual(await snapshot(data.root), before);
  });
}

test('copy option requires a selection and is documented in help', async (t) => {
  const data = await fixture(t);
  await expectFailure(['add', '--copy'], data, (stderr) => {
    assert.match(stderr, /requires a skill name or group/);
  });
  await assertMissing(target(data));
  assert.match((await run(['--help'], data)).stdout, /--copy/);
});
