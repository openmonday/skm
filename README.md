# skm

`skm` manages skills from a local source directory and installs them into projects as symlinks by default, or as file copies with `--copy`. Edit the local skill source to update every project linked to it.

## Install

From this repository:

```sh
bash scripts/setup-cli.sh
```

The script runs `npm link` to register the current checkout and checks that the CLI starts. It can be run from any directory using its absolute path. After moving the repository, rerun the script from its new location to repair the global link. Node.js and npm must be available; the link uses the active npm global prefix (and therefore the active Node.js version when using nvm).

The global `skm` command links to this checkout. Its default skill root is the package's own `skills/` directory, resolved from the module location (`../skills`), so it works from any project without shell environment changes.

## Local skill root

The skill root is the directory containing the categories and `groups.json` directly:

```text
skills/
├── groups.json
├── dev/
│   ├── draw-map/
│   │   └── SKILL.md
│   └── ...
└── teach/
    ├── teach/
    │   └── SKILL.md
    └── ...
```

Set `SKM_HOME` to override this root. Skills are discovered recursively at directories containing `SKILL.md`; each directory's basename is its short skill name. Duplicate physical skill directories with the same basename are an error. Project symlinks use flat names, such as `.agents/skills/draw-map`, regardless of category depth.

`skm init` creates the root when needed. If `groups.json` is absent, it creates groups from the top-level category directories and their discovered skills. Rerunning it preserves an existing `groups.json`.

`groups.json` maps group names to plain arrays of short skill names:

```json
{
  "groups": {
    "dev": ["draw-map", "show-me", "wait-what"],
    "teach": ["show-me", "teach"]
  }
}
```

This example shows a subset of the bundled skills. Groups may share skills across categories; `show-me` belongs to both `dev` and `teach`. Edit `groups.json` to maintain group membership.

## Commands

```sh
# Initialize the local skill root and any missing groups.json
skm init

# Install explicit skill names
skm add grill-me implement

# Copy complete skill directories when symlinks are unavailable
skm add --copy grill-me implement
skm add @dev --copy

# Install groups by shorthand or --group
skm add @dev @teach
skm add --group dev --group teach

# Mix explicit names and groups
skm add @dev teach

# List local skills, groups, and project installation status
skm list
skm list --json
```

When a command selects the same skill more than once, `add` warns on stderr with the selection origins, installs it once, and succeeds. Re-adding a skill already linked in the project reports that it is already linked.

`--copy` copies the complete skill directory, including supporting files and subdirectories, and dereferences source symlinks so the installed files do not require symlink support. It can replace an existing project symlink with a copy. Existing real files and directories are never overwritten; to refresh a copied skill or switch it back to a symlink, remove its installed directory first and run `add` again. Copies do not receive source edits automatically. `list` recognizes same-name directories containing a `SKILL.md` file as installed.

Project installations default to `.agents/skills`. Set `SKM_TARGET_DIR` to change that directory, using a path relative to the current project or an absolute path.

For the bundled skills and the dev workflow, see [skills/README.md](skills/README.md).
