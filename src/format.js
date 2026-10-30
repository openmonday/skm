const CODES = { bold: [1, 22], dim: [2, 22], red: [31, 39], green: [32, 39], yellow: [33, 39], cyan: [36, 39] };

export function createStyle(stream = process.stdout, env = process.env) {
  const enabled = env.FORCE_COLOR
    ? env.FORCE_COLOR !== '0'
    : !env.NO_COLOR && Boolean(stream.isTTY) && env.TERM !== 'dumb';
  const style = {};
  for (const [name, [open, close]] of Object.entries(CODES)) {
    style[name] = (text) => (enabled ? `\u001b[${open}m${text}\u001b[${close}m` : String(text));
  }
  style.enabled = enabled;
  return style;
}

export const out = createStyle(process.stdout);
export const err = createStyle(process.stderr);

const ACTIONS = {
  linked: ['✔', 'green'],
  copied: ['✔', 'green'],
  updated: ['↻', 'cyan'],
  'already linked': ['•', 'dim'],
};

// Decorates "<action> <skill>" lines emitted by installSkills.
export function formatAction(line, style = out) {
  for (const [action, [icon, color]] of Object.entries(ACTIONS)) {
    if (line.startsWith(`${action} `)) {
      const name = line.slice(action.length + 1);
      return `${style[color](icon)} ${style[color](action)} ${style.bold(name)}`;
    }
  }
  return line;
}
