#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { getConfig } from './config.js';
import { initRepository, readCatalog } from './catalog.js';
import { installSkills, linkPointsTo } from './links.js';
import { out, err, formatAction } from './format.js';

const HELP = `Usage:
  skm init
  skm add <skill...> [--copy]
  skm add --group <group> [--copy]
  skm add @<group...> [--copy]
  skm list [--json]

Options:
  --copy           Copy skill directories instead of creating symlinks

Environment:
  SKM_HOME         Skill repository root (default: bundled skills/)
  SKM_TARGET_DIR   Project installation directory (default: .agents/skills)
`;

function fail(message) {
  console.error(`${err.red(err.bold('Error:'))} ${message}`);
  process.exitCode = 1;
}

function parseAddArgs(args) {
  const requests = [];
  let copy = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--copy') {
      copy = true;
    } else if (arg === '--group') {
      if (!args[index + 1] || args[index + 1].startsWith('-')) {
        throw new Error('--group requires a group name.');
      }
      requests.push(`@${args[index + 1]}`);
      index += 1;
    } else if (arg.startsWith('--group=')) {
      const group = arg.slice('--group='.length);
      if (!group) throw new Error('--group requires a group name.');
      requests.push(`@${group}`);
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option "${arg}".`);
    } else {
      requests.push(arg);
    }
  }
  if (requests.length === 0) throw new Error('add requires a skill name or group.');
  return { requests, copy };
}

function printList(config, catalog, installed, asJson) {
  const result = {
    repository: config.skillsDir,
    target: config.targetDir,
    skills: [...catalog.skills.keys()].sort().map((name) => ({
      name,
      installed: installed.has(name),
    })),
    groups: Object.fromEntries(
      Object.entries(catalog.groups)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([name, members]) => [name, members]),
    ),
  };

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const label = (text) => out.dim(text.padEnd(11));
  const installedCount = result.skills.filter((skill) => skill.installed).length;
  console.log(`${label('Repository')}${result.repository}`);
  console.log(`${label('Target')}${result.target}`);
  console.log();
  console.log(`${out.bold('Skills')} ${out.dim(`(${installedCount} of ${result.skills.length} installed)`)}`);
  if (result.skills.length === 0) console.log(`  ${out.dim('(none)')}`);
  for (const skill of result.skills) {
    console.log(skill.installed
      ? `  ${out.green('●')} ${out.bold(skill.name)}  ${out.green('installed')}`
      : `  ${out.dim('○')} ${skill.name}`);
  }
  console.log();
  console.log(`${out.bold('Groups')} ${out.dim(`(${Object.keys(result.groups).length})`)}`);
  const groups = Object.entries(result.groups);
  if (groups.length === 0) console.log(`  ${out.dim('(none)')}`);
  const width = Math.max(0, ...groups.map(([name]) => name.length + 1));
  for (const [name, members] of groups) {
    const names = members.length === 0 ? out.dim('(empty)') : members.join(out.dim(', '));
    console.log(`  ${out.cyan(`${name}:`.padEnd(width))}  ${names}`);
  }
}

async function getInstalled(config, catalog) {
  const installed = new Set();
  try {
    const entries = await fs.readdir(config.targetDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && catalog.skills.has(entry.name)) {
        try {
          if ((await fs.stat(path.join(config.targetDir, entry.name, 'SKILL.md'))).isFile()) {
            installed.add(entry.name);
          }
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
      }
      if (!entry.isSymbolicLink()) continue;
      const sourcePath = catalog.skills.get(entry.name);
      if (!sourcePath) continue;
      const linkPath = path.join(config.targetDir, entry.name);
      const currentTarget = await fs.readlink(linkPath);
      if (linkPointsTo(linkPath, currentTarget, sourcePath)) installed.add(entry.name);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return installed;
}

async function main(argv) {
  const [command, ...args] = argv;
  const config = getConfig();

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    console.log(HELP);
    return;
  }

  if (command === 'init') {
    if (args.length > 0) throw new Error('init does not accept arguments.');
    await initRepository(config);
    console.log(`${out.green('✔')} Initialized local skill repository at ${out.bold(config.home)}`);
    return;
  }

  if (!['add', 'list'].includes(command)) {
    throw new Error(`Unknown command "${command}".\n\n${HELP}`);
  }

  const catalog = await readCatalog(config);
  if (command === 'add') {
    const { requests, copy } = parseAddArgs(args);
    await installSkills(config, catalog, requests, (line) => console.log(formatAction(line)), console.warn, { copy });
    return;
  }
  if (command === 'list') {
    const unknown = args.filter((arg) => arg !== '--json');
    if (unknown.length > 0) throw new Error(`Unknown option "${unknown[0]}".`);
    printList(config, catalog, await getInstalled(config, catalog), args.includes('--json'));
    return;
  }

  throw new Error(`Unknown command "${command}".\n\n${HELP}`);
}

main(process.argv.slice(2)).catch((error) => fail(error.message));
