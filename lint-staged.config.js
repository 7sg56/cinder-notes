export default {
  'src/**/*.{ts,tsx}': ['eslint', 'prettier --check'],
  'src/**/*.css': 'prettier --check',
  'src-tauri/**/*.rs': () => 'cargo fmt --check --manifest-path src-tauri/Cargo.toml',
};
