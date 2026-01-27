import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';
import { MainLayout } from './components/layout/MainLayout';
import { FileExplorer } from './components/layout/explorer/FileExplorer';
import { EditorPane } from './components/layout/editor/EditorPane';
import { Onboarding } from './components/onboarding/Onboarding';

function App() {
  // Check for onboarding status synchronously to prevent flash
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem('cinder:onboarded') === 'true';
  });

  // If already onboarded, resize window to editor size on mount
  useEffect(() => {
    if (hasOnboarded) {
      invoke('resize_to_editor').catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // DEV ONLY: Cmd/Ctrl+Shift+O to toggle onboarding
  useEffect(() => {
    if (import.meta.env.DEV) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
          e.preventDefault();
          if (hasOnboarded) {
            localStorage.removeItem('cinder:onboarded');
            invoke('resize_to_onboarding').catch(console.error);
            setHasOnboarded(false);
            console.log('[DEV] Onboarding reset');
          } else {
            localStorage.setItem('cinder:onboarded', 'true');
            invoke('resize_to_editor').catch(console.error);
            setHasOnboarded(true);
            console.log('[DEV] Onboarding skipped');
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [hasOnboarded]);

  const handleOnboardingComplete = async (mode: 'new' | 'open') => {
    // Persist onboarding status
    localStorage.setItem('cinder:onboarded', 'true');
    localStorage.setItem('cinder:startMode', mode);

    // Resize window to editor size
    await invoke('resize_to_editor');

    // Update state to trigger transition
    setHasOnboarded(true);
  };

  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <MainLayout
      sidebarContent={<FileExplorer />}
      editorContent={<EditorPane />}
    />
  );
}

export default App;
