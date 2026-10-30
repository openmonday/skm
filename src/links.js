import fs from 'node:fs/promises';
import path from 'node:path';

async function pathExists(filePath) {
  try {
    await fs.lstat(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

export function linkPointsTo(linkPath, linkTarget, sourcePath) {
  return path.resolve(path.dirname(linkPath), linkTarget) === path.resolve(sourcePath);
}

export async function installSkills(config, catalog, names, output = console.log, warn = console.warn, { copy = false } = {}) {
  const selected = resolveNames(catalog, names, warn);
  await fs.mkdir(config.targetDir, { recursive: true });
  for (const name of selected) {
    const linkPath = path.join(config.targetDir, name);
    if (await pathExists(linkPath) && !(await fs.lstat(linkPath)).isSymbolicLink()) {
      throw new Error(`Cannot install "${name}": ${linkPath} already exists and is not a symlink.`);
    }
  }

  for (const name of selected) {
    const linkPath = path.join(config.targetDir, name);
    const sourcePath = catalog.skills.get(name);
    const exists = await pathExists(linkPath);

    if (exists) {
      const stat = await fs.lstat(linkPath);
      if (!stat.isSymbolicLink()) {
        throw new Error(`Cannot install "${name}": ${linkPath} already exists and is not a symlink.`);
      }
      const currentTarget = await fs.readlink(linkPath);
      if (!copy && linkPointsTo(linkPath, currentTarget, sourcePath)) {
        output(`already linked ${name}`);
        continue;
      }
      await fs.unlink(linkPath);
      if (copy) {
        await fs.cp(sourcePath, linkPath, { recursive: true, dereference: true, force: false, errorOnExist: true });
        output(`copied ${name}`);
      } else {
        await fs.symlink(sourcePath, linkPath, 'dir');
        output(`updated ${name}`);
      }
      continue;
    }

    if (copy) {
      await fs.cp(sourcePath, linkPath, { recursive: true, dereference: true, force: false, errorOnExist: true });
      output(`copied ${name}`);
    } else {
      await fs.symlink(sourcePath, linkPath, 'dir');
      output(`linked ${name}`);
    }
  }

  return selected;
}

export function resolveNames(catalog, requests, warn = console.warn) {
  const selected = new Map();
  const warnings = [];
  const addSkill = (name, origin) => {
    if (!catalog.skills.has(name)) {
      throw new Error(`Skill "${name}" was not found in the local repository.`);
    }
    if (selected.has(name)) {
      warnings.push(
        `WARNING: "${name}" selected by both ${selected.get(name)} and ${origin}; installing once.`,
      );
    } else {
      selected.set(name, origin);
    }
  };
  const addGroup = (name) => {
    if (!name || !Object.hasOwn(catalog.groups, name)) {
      throw new Error(`Skill group "${name}" was not found in the local repository.`);
    }
    for (const member of catalog.groups[name]) addSkill(member, `@${name}`);
  };

  for (const request of requests) {
    if (request.startsWith('@')) addGroup(request.slice(1));
    else addSkill(request, `explicit "${request}"`);
  }
  for (const warning of warnings) warn(warning);
  return [...selected.keys()];
}
