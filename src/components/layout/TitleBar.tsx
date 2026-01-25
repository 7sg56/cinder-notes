export function TitleBar() {
    return (
        <div 
            className="h-[35px] flex items-center justify-center border-b select-none drag-region"
            style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)'
            }}
        >
            <span 
                className="text-[13px] font-medium opacity-80"
                style={{ color: 'var(--text-primary)' }}
            >
                Cinder Notes
            </span>
        </div>
    );
}
