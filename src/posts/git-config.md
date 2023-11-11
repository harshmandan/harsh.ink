---
title: 'Git identity by remote, not by machine'
date: '11-11-2023'
updated: '11-11-2023'
categories:
  - 'git'
excerpt: A Git config that picks your name, email and SSH key from the repo's remote URL, so a work commit can't go out with your personal email on it.
---

Ever had to juggle a work email and a personal email across different repos? Get it wrong once and your personal address ends up on a work commit, and the fix is an amend and a force-push.

Git can sort this out from your global config. Set it up once and it picks the right name, email and SSH key for each repo, so there's nothing to guess or double-check before you commit.

The feature that does this is `includeIf` in `~/.gitconfig`. It tells Git: _if the repo you're in has a remote pointing at X, load this other config file on top._ The extra file can override `user.name`, `user.email`, `credential.helper` or any other setting. Add `~/.ssh/config` to pick the SSH key, and that covers every repo I work in: personal projects, two day jobs and an old client repo I haven't opened in a year.

Below is the setup, one case at a time.

## The base case: one identity, one host

If you only ever push to one place under one name, Git's defaults are fine:

```ini
# ~/.gitconfig
[user]
	name = Your Name
	email = you@example.com
```

The rest of this post is for when that stops being true.

## Case 1: personal and work accounts on different hosts

Say personal projects go to GitHub and work goes to a self-hosted GitLab, each with its own name, email and SSH key. The top-level `~/.gitconfig` stays small and stops setting `[user]` itself. Instead, it points at sub-configs based on the remote URL:

```ini
# ~/.gitconfig
[includeIf "hasconfig:remote.*.url:**/*github.com*/**"]
	path = ~/.config/git/config-github

[includeIf "hasconfig:remote.*.url:**/*gitlab.work-internal.example*/**"]
	path = ~/.config/git/config-work-gitlab
```

`hasconfig:remote.*.url:` was added in Git 2.36. It checks every remote URL on the current repo and loads the file if any of them match the glob. Before that, the closest option was `gitdir:`, which matches on the folder the repo lives in. That works if every work repo sits under `~/code/work/`, and breaks down as soon as one doesn't.

The two sub-configs are short:

```ini
# ~/.config/git/config-github
[user]
	name = your-personal-handle
	email = you@example.com
```

```ini
# ~/.config/git/config-work-gitlab
[user]
	name = your-work-handle
	email = you@work-internal.example
[credential "https://gitlab.work-internal.example"]
	helper = osxkeychain
```

In a personal repo, `git config user.email` prints the personal address. In a work repo, the same command prints the work one. There's nothing to set per repo.

## Case 2: multiple GitHub orgs on the same host

This case needs one more step. All your GitHub orgs live on `github.com`, so the glob `**/*github.com*/**` matches every one of them.

To tell them apart, match on the org name in the URL as well:

```ini
# ~/.gitconfig - append below the first two includes

# match repos whose remote contains "/work-a/"
[includeIf "hasconfig:remote.*.url:**/*github.com*/work-a/**"]
	path = ~/.config/git/config-gh-work-a

# match repos whose remote contains "/work-b/"
[includeIf "hasconfig:remote.*.url:**/*github.com*/work-b/**"]
	path = ~/.config/git/config-gh-work-b
```

The glob matches the org slug after `github.com/`. A repo cloned from `git@github.com:work-a/some-repo.git` or `https://github.com/work-a/some-repo` matches the first rule, and anything under `work-b/` matches the second. The personal `config-github` still loads too, because its broader rule also matches. The per-org file loads after it, so its `[user]` block wins.

Order matters here: when two included files set the same key, the one loaded later wins. Put the broad rule for all of GitHub first, then the narrower per-org rules below it.

The per-org files look like the other sub-configs:

```ini
# ~/.config/git/config-gh-work-a
[user]
	name = your-work-a-handle
	email = you@work-a.example

# If you push via HTTPS instead of SSH for this org, you can also
# embed a per-org credential rule:
[credential "https://github.com/work-a"]
	helper = osxkeychain
```

`config-gh-work-b` has the same shape. Adding another org takes one new file and one new `includeIf` block.

## Case 3: SSH keys per host

Picking the right name and email is half the problem. The other half is which key SSH sends to the server. SSH offers your keys one at a time, and GitHub accepts the first one that belongs to _any_ account. If that's your personal key, GitHub treats you as your personal account, and a work repo answers with `ERROR: Repository not found`. With enough keys loaded, the server can also stop early with `Too many authentication failures`.

`~/.ssh/config` lets you say "for this host, use this key and nothing else":

```sshconfig
# ~/.ssh/config

Host github.com
	HostName github.com
	IdentityFile ~/.ssh/github_personal
	IdentitiesOnly yes
	AddKeysToAgent yes
	UseKeychain yes

Host gitlab.work-internal.example
	HostName gitlab.work-internal.example
	IdentityFile ~/.ssh/gitlab_work
	IdentitiesOnly yes
```

`IdentitiesOnly yes` is the line that's easy to miss. Without it, SSH still offers every key in the agent, whatever `IdentityFile` says. With it, only the named key is tried.

### Different keys for different GitHub orgs

`github.com` is one host, so you can't give it two `IdentityFile`s. Use an SSH host alias instead: a made-up hostname that connects to `github.com` but uses a different key.

```sshconfig
# ~/.ssh/config (append)

Host github.com-work-a
	HostName github.com
	IdentityFile ~/.ssh/github_work_a
	IdentitiesOnly yes
```

Then, in any repo that should use the work-a key, point the remote at the alias:

```bash
# Before
git remote set-url origin git@github.com:work-a/some-repo.git

# After - same host underneath, different key via the alias
git remote set-url origin git@github.com-work-a:work-a/some-repo.git
```

Git doesn't look up the hostname itself. It passes the URL to SSH, which finds the alias in `~/.ssh/config`, connects to the real `github.com` and offers `github_work_a`. Only the remote URL changes; clone, push and pull work as usual.

The cost is one `git remote set-url` per work-a repo, and remotes that use the alias instead of plain `github.com`.

## Checking it works

To check the setup:

```bash
# In any repo, check which identity git will use
cd ~/code/personal-project && git config user.email
# you@example.com

cd ~/code/work-a-project && git config user.email
# you@work-a.example

# Check which SSH key SSH will offer for a given host
ssh -vT git@github.com 2>&1 | grep 'Offering'
# debug1: Offering public key: ~/.ssh/github_personal

ssh -vT git@github.com-work-a 2>&1 | grep 'Offering'
# debug1: Offering public key: ~/.ssh/github_work_a
```

If `git config user.email` prints the wrong address, the `includeIf` glob didn't match. Usually the URL has a typo, or it doesn't contain the exact text the glob looks for. Run `git config --show-origin user.email` to see which file the value came from. If it says `~/.gitconfig`, none of your includes matched.

## The final shape

Six files, set up once:

```
~/.gitconfig                              - only `includeIf` directives
~/.config/git/config-github               - personal identity
~/.config/git/config-work-gitlab          - work GitLab identity
~/.config/git/config-gh-work-a            - work-a identity (overrides personal)
~/.config/git/config-gh-work-b            - work-b identity (overrides personal)
~/.ssh/config                             - per-host key selection
```

I copy these six files onto every new laptop, and they've stopped at least three commits from going out with the wrong email.
