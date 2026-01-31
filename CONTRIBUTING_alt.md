# How to contribute to Cinder Notes

**Thanks for helping Cinder Notes grow!** Bug fixes, features, docs, performance tuning, accessibility, and any other improvements are welcome through [pull requests](https://github.com/7sg56/cinder-notes/compare/).

## Prerequisites

- **Node.js**: LTS version recommended ([Download](https://nodejs.org/)).
- **Rust & Cargo**: Follow the installation steps below for your operating system.
- **System Dependencies**:
  - **Linux**: `libwebkit2gtk-4.0-dev`, `build-essential`, `libssl-dev`, `libgtk-3-dev`, etc. (See [Tauri Guide](https://tauri.app/v1/guides/getting-started/prerequisites#linux))
  - **Windows/macOS**: Ensure you have build tools installed (VS C++ Build Tools or Xcode).



### Installing Rust & Cargo

#### 🍎 macOS & 🐧 Linux
Run the following command in your terminal:

```bash
# Install rustup (the Rust installer)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Configure your current shell
source $HOME/.cargo/env
```

## Contribution Workflow

We follow a classic open-source workflow using Forks and Pull Requests.

1.  **Fork the repository**: Click the "Fork" button on the top right of the repository page to create your own copy.
2.  **Clone your fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/cinder-notes.git
    cd cinder-notes
    ```
3.  **Create a Branch**: Always create a new branch for your changes.
    ```bash
    git checkout -b feat/your-feature-name
    ```
4.  **Make Changes & Commit**:
    ```bash
    git add .
    git commit -m "feat: add amazing feature"
    ```
5.  **Push to your Fork**:
    ```bash
    git push origin feat/your-feature-name
    ```
6.  **Open a Pull Request**: Go to the original `cinder-notes` repository and you'll see a prompt to open a PR from your branch. Target the `main` branch.

- `main` is the primary branch. All PRs should target `main`.

## Local Setup

1.  **Clone your fork** (as described above):
    ```bash
    git clone https://github.com/YOUR_USERNAME/cinder-notes.git
    cd cinder-notes
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Verify Environment**:
    Ensure `rustc --version` and `cargo --version` return valid versions.

## Build & Run

-   **Development Mode**:
    ```bash
    npm run tauri:dev
    ```
    This command starts the frontend server and the Tauri backend in watch mode.

-   **Production Build**:
    ```bash
    npm run tauri:build
    ```
    Artifacts will be in `src-tauri/target/release/`.

## Code Style & Quality

-   **Linting**:
    -   Run `npm run lint` to check for code style issues.
    -   Run `npm run typecheck` to verify TypeScript types.
-   **Formatting**:
    -   We use Prettier. Ensure your editor is configured to format on save, or run `npm run format` (if script exists) or use your IDE's formatter.
-   **Scope**: Keep diffs focused. Avoid committing `node_modules`, `src-tauri/target`, or other ignored paths.
-   **Visual Verification**: If you modify UI, include a screenshot or short video in your PR description so reviewers can verify the change quickly.

## Commit & Pull Requests

-   **Commit Messages**: Use the [Conventional Commits](https://www.conventionalcommits.org/) format (e.g., `feat: add welcome page`, `fix: resolve file renaming bug`).
-   **Squash**: Squash unrelated changes into separate commits/PRs.
-   **Rebase**: Ensure your branch is updated with the latest `main` before requesting review.
-   **PR Template**: Fill in the PR template and describe testing steps (manual or automated).

## Issues & Feature Ideas

-   **Discussion**: For sizeable features, open a discussion/issue first so we can align on scope and UX.
-   **Bugs**: When reporting bugs, include the OS version, app version, reproduction steps, and relevant logs if available.
-   **Minor Fixes**: Typos or minor doc fixes can go straight to PRs without an issue.

## Release Build

To build a release version locally for testing:
```bash
npm run tauri:build
```
This typically requires setup for code signing particularly on macOS. For local testing, ad-hoc signatures often suffice or you can run in dev mode.

Thank you for investing time in Cinder Notes! ❤️
