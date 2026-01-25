# Contributing to Cinder Notes

Thank you for your interest in contributing to Cinder Notes! We welcome contributions from everyone.

## Before you start
- **Star the repo** ⭐: It's optional but really appreciated!
- **Check existing issues**: Before opening a new one, please check if it has already been reported or discussed.

## Development Setup

### 1. Install Prerequisites

#### Node.js
You need Node.js (LTS version recommended) to manage frontend dependencies.
- [Download Node.js](https://nodejs.org/)

#### Rust & Cargo
Since this is a Tauri app, you need the Rust toolchain installed.
1. **Install via Rustup**:
   Run the following in your terminal (macOS/Linux):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
   *For Windows, download the executable from [rustup.rs](https://rustup.rs).*

2. **Verify Installation**:
   Restart your terminal and run:
   ```bash
   rustc --version
   cargo --version
   ```

> **Linux Users**: You'll likely need system webkit dependencies. Please run:
> `sudo apt-get install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev`
> *(See [Tauri Linux Guide](https://tauri.app/v1/guides/getting-started/prerequisites#linux) for other distros)*

### 2. Project Setup
   ```bash
   # Clone the repository
   git clone https://github.com/7sg56/cinder-notes.git
   cd cinder-notes

   # Install dependencies
   npm install
   ```

3. **Running**:
   ```bash
   # Start the app in development mode
   npm run tauri:dev
   ```

## How to contribute
1. **Fork the repo** to your GitHub account.
2. **Create a new branch** for your feature or fix.
   - Use the format: `feat/your-feature-name` or `fix/bug-name`
3. **Make your changes** in the codebase.
4. **Open a Pull Request** (PR) to the `main` branch.

## Code rules
- **Keep code readable**: Write clean, self-documenting code.
- **Follow existing style**: Consistency is key.
- **Comment complex logic**: If it's hard to write, it's hard to read. Explain the *why*, not just the *how*.

## What NOT to do
- ❌ **No unrelated refactors**: keep your PR focused on the specific feature or fix.
- ❌ **No breaking changes** without prior discussion in an issue.
