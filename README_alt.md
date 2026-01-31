<h4 align="right">English | <strong><a href="#">简体中文</a></strong></h4>

<p align="center">
  <a href="#" target="_blank"><img src="https://placehold.co/138x138/orange/white?text=Cinder" width="138" alt="Cinder Notes Logo" /></a>
  <h1 align="center">Cinder Notes</h1>
  <div align="center">
    <!-- PLACEHOLDERS FOR BADGES -->
    <a href="#" target="_blank">
      <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square"></a>
    <a href="#" target="_blank">
      <img alt="Tauri" src="https://img.shields.io/badge/built%20with-Tauri-orange?style=flat-square&logo=tauri"></a>
    <a href="#" target="_blank">
      <img alt="React" src="https://img.shields.io/badge/frontend-React-61DAFB?style=flat-square&logo=react"></a>
    <a href="#" target="_blank">
      <img alt="Rust" src="https://img.shields.io/badge/backend-Rust-black?style=flat-square&logo=rust"></a>
    <img alt="Windows 10+" src="https://img.shields.io/badge/Windows-10%2B-blue?style=flat-square&logo=windows">
    <img alt="macOS 12+" src="https://img.shields.io/badge/macOS-12%2B-white?style=flat-square&logo=apple">
  </div>
  <div align="center">The editor for what's next. Minimal, distraction-free, and blazing fast.</div>
</p>

<!-- DEMO GIF/VIDEO PLACEHOLDER -->
<p align="center">
    <img src="https://placehold.co/900x500/1a1a1a/orange?text=Demo+Video+Placeholder" width="900px" alt="Cinder Notes Demo" />
</p>

## Features

- **Zed-Inspired Welcome**: A clean, keyboard-centric welcome page to jumpstart your workflow.
- **Instant Creation**: Create files instantly (`untitled.md`) and rename them inline with a double-click.
- **Split Editor**: Write in Markdown and see the preview in real-time.
- **Beautiful UI**: Dark mode, minimalist design, and smooth animations.
- **Fast**: Built with Tauri (Rust + React), combining native performance with web flexibility.
- **Secure**: Local-first, no data collection.

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/7sg56/cinder-notes.git
   cd cinder-notes
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Mode**:
   ```bash
   npm run tauri:dev
   ```
   This will launch the application in a native window.

4. **Build for Production**:
   ```bash
   npm run tauri:build
   ```
   Artifacts will be generated in `src-tauri/target/release/`.

**Why not Electron?** We chose Tauri to keep the app lightweight and secure. The backend logic is written in Rust, ensuring high performance and memory efficiency.

## Split Editor & Preview Mode

Edit and preview side by side with real-time syncing.

**Distraction-Free**: Collapse the file explorer to focus entirely on your writing. The interface is designed to disappear when you don't need it.

<img src="https://placehold.co/900x400/2a2a2a/orange?text=Split+Editor+Screenshot" width="100%" alt="Split Editor & Preview Mode" />

## Roadmap & Next Steps

We are currently in the **scaffolding stage**.

### 1. File Tree Implementation
We are implementing the file explorer and tree structure. Use Tauri's `fs` (FileSystem) APIs to read directories, manage files, and populate the file tree.

### 2. Feature Additions
Once the file system foundation is in place, we will proceed with adding core note-taking features, rich text editing, and other planned functionality.

### 3. UI/UX Improvements
We will continue to refine the user interface and experience, ensuring it is intuitive and user-friendly.

### 4. Encryption
We will implement encryption for sensitive data to ensure user privacy and security.

### Timeline
- **v1 Alpha**: Expected Feb 2026
- **v1 Stable**: Expected Q2 2026

## Support

1. **Star the Repo**: If you enjoy Cinder Notes, please star the project on GitHub!
2. **Contribute**: Check out [CONTRIBUTING.md](CONTRIBUTING.md) to see how you can help.
3. **Feedback**: Open an issue or discussion to share your ideas.

## Acknowledgments

- [Tauri](https://tauri.app/) - The framework that makes this minimal footprint possible.
- [Lucide Icons](https://lucide.dev/) - Beautiful, consistent icons.
- [React](https://reactjs.org/) - For the dynamic and responsive UI.

## License

MIT License - Feel free to use and contribute.
