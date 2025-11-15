Repository and GitHub instructions

Assumption: your GitHub username is `AmiRus-C` with nickname `Nicshuz_`. If different, replace occurrences below.

What I changed locally:
- Bumped `package.json` version to `0.0.1`.
- Set `author` field to `AmiRus-C (Nicshuz_) - https://github.com/AmiRus-C` and added `repository` / `homepage` placeholders.
- Added `.gitignore` to exclude `node_modules`, `data`, `logs` and local files.
- Added `LICENSE` (MIT).

How to create a private GitHub repository and push this project (recommended):

1) Using the GitHub CLI (if installed and authenticated):

```powershell
cd 'C:\Users\Lenovo\Desktop\FLClient\MinecraftBot'
# create a private repo and push current directory
gh repo create AmiRus-C/minecraft-learning-bot --private --source=. --remote=origin --push
```

2) If you prefer the web UI:
- Create a new repository on GitHub: https://github.com/new
- Set repository name: `minecraft-learning-bot`
- Set Visibility: Private
- Do NOT initialize with README/license (we already have files locally)
- After repo creation, follow the "…or push an existing repository from the command line" instructions; typical commands:

```powershell
cd 'C:\Users\Lenovo\Desktop\FLClient\MinecraftBot'
git remote add origin https://github.com/AmiRus-C/minecraft-learning-bot.git
git branch -M main
git push -u origin main
```

Security note: do NOT paste GitHub personal access tokens or credentials into chat. Use the `gh` CLI or your browser session to create the repo and push.

Optional: make repository private to you and invite collaborators later via GitHub Settings → Manage access.

If you want, I can prepare a PR template, issues templates, or add a basic GitHub Actions CI (I already added a simple workflow file). If you'd like me to try creating the remote repo automatically, I will need you to either run the `gh` command locally or securely provide an access token (not recommended in chat).  
