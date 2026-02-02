# Contributing to Cinder Notes

**We'd be thrilled if you contribute!** 🔥

We're a small team of students building this in our spare time. There's a *lot* still to be done, and frankly, we could use all the help we can get. Whether you're fixing a typo, refactoring messy code, adding a feature, or just sharing an idea — we're grateful.

## A Note on Code Quality

Let's be honest: **our code isn't perfect.** We're students, we're learning, and we're building as we go. If you see something that makes you cringe — a hacky workaround, an anti-pattern, or just a better way to do things — please don't hesitate to fix it or tell us about it.

We're open to:
- Refactors and rewrites
- Architecture suggestions
- Performance improvements
- "You know, there's a library for that..." moments
- Honest feedback (be kind, but be real)

---

## How to Contribute

### 1. Fork & Clone

```bash
# Fork via GitHub, then:
git clone https://github.com/YOUR_USERNAME/cinder-notes.git
cd cinder-notes
```

### 2. Install Dependencies

```bash
npm install
```

**Prerequisites:**
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install) — Run `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Linux users**: You'll need some system libs. See [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites#linux).

### 3. Create a Branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/issue-description
```

### 4. Make Your Changes

Run the app in dev mode to see your changes:

```bash
npm run tauri dev
```

### 5. Commit & Push

```bash
git add .
git commit -m "feat: add something awesome"
git push origin feat/your-feature-name
```

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, etc.), but don't stress too much about it.

### 6. Open a Pull Request

Head to the original repo and open a PR against `main`. Tell us:
- What you changed
- Why you changed it
- Screenshots if it's a UI change

---

## What Can You Work On?

Here are some areas where we'd especially love help:

| Area | What Needs Doing |
|------|------------------|
| **File System** | Persisting files to disk via Tauri FS APIs |
| **Keyboard Shortcuts** | Implementing Ctrl+N, Ctrl+S, etc. |
| **Search** | Full-text search across notes |
| **Markdown** | Better parsing, syntax highlighting improvements |
| **Performance** | Profiling, lazy loading, bundle optimization |
| **Accessibility** | Screen reader support, keyboard navigation |
| **Tests** | We have... basically none. Help. |

Or just pick something from the [Issues](https://github.com/7sg56/cinder-notes/issues)!

---

## Code Style

- Run `npm run lint` before committing
- Run `npm run typecheck` to catch TypeScript errors
- Keep PRs focused — one feature/fix per PR
- If you touch UI, include a screenshot

---

## Have an Idea?

Open an issue or start a discussion! We'd rather talk through a big change before you spend hours on it. That said, if you're feeling bold, just go for it — worst case, we learn something.

---

## Thank You

Seriously. We know your time is valuable, and the fact that you're even reading this means a lot. Every contribution, no matter how small, helps make Cinder better.

Let's build something great together. 🔥

— The Cinder Team
