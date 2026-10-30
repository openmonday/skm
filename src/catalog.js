import fs from 'node:fs/promises';
import path from 'node:path';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function discoverSkills(root) {
  const skills = new Map();

  async function visit(directory, ancestors) {
    const realDirectory = await fs.realpath(directory);
    if (ancestors.has(realDirectory)) return;
    const nextAncestors = new Set([...ancestors, realDirectory]);
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      if (entry.name.startsWith('.') || (!entry.isDirectory() && !entry.isSymbolicLink())) continue;
      const candidate = path.join(directory, entry.name);
      let stat;
      try {
        stat = await fs.stat(candidate);
      } catch (error) {
        if (error.code === 'ENOENT') continue;
        throw error;
      }
      if (!stat.isDirectory()) continue;

      let hasSkill = false;
      try {
        hasSkill = (await fs.stat(path.join(candidate, 'SKILL.md'))).isFile();
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      if (hasSkill) {
        if (skills.has(entry.name)) {
          throw new Error(
            `Duplicate skill name "${entry.name}": ${skills.get(entry.name)} and ${candidate}.`,
          );
        }
        skills.set(entry.name, candidate);
      } else {
        await visit(candidate, nextAncestors);
      }
    }
  }

  await visit(root, new Set());
  return skills;
}

export async function readCatalog(config) {
  try {
    await fs.access(config.skillsDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        `Local skill repository not found: ${config.skillsDir}. Run "skm init" or set SKM_HOME.`,
      );
    }
    throw error;
  }
  const skills = await discoverSkills(config.skillsDir);

  let groups = {};
  try {
    const parsed = JSON.parse(await fs.readFile(config.groupsFile, 'utf8'));
    if (!isObject(parsed) || !isObject(parsed.groups)) {
      throw new Error('"groups" must be an object.');
    }
    groups = parsed.groups;
    for (const [name, members] of Object.entries(groups)) {
      if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !member)) {
        throw new Error(`group "${name}" members must be an array of non-empty skill names.`);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Invalid groups file ${config.groupsFile}: ${error.message}`);
    }
  }

  return { skills, groups };
}

export async function initRepository(config) {
  await fs.mkdir(config.skillsDir, { recursive: true });
  try {
    await fs.access(config.groupsFile);
    return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const skills = await discoverSkills(config.skillsDir);
  const categories = new Map();
  for (const [name, sourcePath] of skills) {
    const parts = path.relative(config.skillsDir, sourcePath).split(path.sep);
    if (parts.length < 2) continue;
    const category = parts[0];
    if (!categories.has(category)) categories.set(category, []);
    categories.get(category).push(name);
  }
  const groups = Object.fromEntries(
    [...categories].map(([category, members]) => [category, members.sort()]),
  );
  try {
    await fs.writeFile(config.groupsFile, `${JSON.stringify({ groups }, null, 2)}\n`, { flag: 'wx' });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}
