import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultHome = fileURLToPath(new URL('../skills', import.meta.url));

export function getConfig(cwd = process.cwd(), env = process.env) {
  const home = path.resolve(cwd, env.SKM_HOME || defaultHome);
  const targetValue = env.SKM_TARGET_DIR || path.join('.agents', 'skills');
  const targetDir = path.isAbsolute(targetValue)
    ? targetValue
    : path.resolve(cwd, targetValue);

  return {
    home,
    skillsDir: home,
    groupsFile: path.join(home, 'groups.json'),
    targetDir,
  };
}
