import { useWorkspace } from '../../hooks/useWorkspace';
import './WorkspaceWelcome.css';

export function WorkspaceWelcome() {
    const { selectAndLoadWorkspace } = useWorkspace();

    const handleChooseFolder = async () => {
        const success = await selectAndLoadWorkspace();
        if (!success) {
            // Could show an error toast here, but for now just log
            console.log('No folder selected or failed to load');
        }
    };

    return (
        <div className="workspace-welcome">
            <div className="workspace-welcome-content">
                <div className="workspace-welcome-icon">🔥</div>
                <h1 className="workspace-welcome-title">Cinder</h1>

                <div className="workspace-welcome-card">
                    <div className="workspace-welcome-card-icon">📁</div>
                    <h2 className="workspace-welcome-card-title">Select Workspace Folder</h2>

                    <button
                        className="workspace-welcome-button"
                        onClick={handleChooseFolder}
                    >
                        📂 Choose Folder...
                    </button>
                </div>
            </div>
        </div>
    );
}
