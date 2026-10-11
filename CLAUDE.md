## gstack (project-local install)

This project uses [gstack](https://github.com/garrytan/gstack) installed at the project level only,
in `.claude/skills/` (gitignored). To set it up on a new machine, from the project root:

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git .claude/skills/gstack
cd .claude/skills/gstack && ./setup --no-team --host claude
```

To update it: `cd .claude/skills/gstack && git pull && ./setup --no-team --host claude`.

Skills like /qa, /ship, /review, /investigate, and /browse are available after install.
Use /browse for all web browsing. Use `.claude/skills/gstack/...` for gstack file paths.
