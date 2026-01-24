# Contributing to Cinder Notes

First off, thanks for taking the time to contribute!

The following is a set of guidelines for contributing to Cinder Notes. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Development Setup

To get started with contributing, you'll need to set up your development environment.

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (LTS version recommended).
- **Rust & Cargo**: Required for Tauri. Follow the [official Tauri prerequisites guide](https://tauri.app/v1/guides/getting-started/prerequisites) to install Rust and other system dependencies.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/7sg56/cinder-notes.git
   cd cinder-notes
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run tauri:dev
   ```
   This will start the frontend dev server and the Tauri application window.

4. **Build for production**:
   To ensure the application builds correctly before submitting a PR:
   ```bash
   npm run tauri:build
   ```

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for Cinder Notes. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible.
- **Provide specific examples** to demonstrate the steps.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Cinder Notes, including completely new features and minor improvements to existing functionality.

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Explain why this enhancement would be useful** to most Cinder Notes users.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### Coding Standards

- Follow the existing code style (Prettier/ESLint configurations are provided).
- Write clean, maintainable, and self-documenting code.
