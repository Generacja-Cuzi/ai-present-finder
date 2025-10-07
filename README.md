# Gift AI Present Finder

## Prerequisites

1. Change `.env` in the `backend/chat-microservice` and paste your OPENAI API KEY there.

2. Install dependencies and start the stack:

```bash
pnpm i
docker compose up
pnpm dev
```

## git-crypt setup

This repository protects sensitive configuration with [git-crypt](https://www.agwa.name/projects/git-crypt/). You need it to unlock encrypted files before working locally.

### Install on macOS

```bash
brew install git-crypt
```

If you do not use Homebrew yet:

1. Install it from <https://brew.sh/>.
2. Re-run the command above.

### Install on Windows Subsystem for Linux (WSL)

Update packages, install the prerequisites, then install git-crypt:

```bash
sudo apt update
sudo apt install git-crypt gnupg
```

### Unlock encrypted files

1. Make sure the shared `private_key` file is available in the project root. If you do not have it, request it from another teammate. Keep this file secure and never commit or upload it elsewhere.

2. Unlock the repository with the shared key:

   ```bash
   git-crypt unlock ./private_key
   ```

3. Verify that encrypted files are accessible, for example:

   ```bash
   git-crypt status
   ```

### Re-locking (optional)

To re-lock files (useful before sharing logs or diffs):

```bash
git-crypt lock
```

Run `git-crypt unlock` again when you need access.
