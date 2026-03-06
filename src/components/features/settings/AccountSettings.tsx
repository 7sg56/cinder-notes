import { useRef } from 'react';
import { User, Shield, KeyRound, Globe, Save } from 'lucide-react';

export function AccountSettings() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 overflow-y-auto w-full h-full p-8 no-scrollbar bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[var(--border-primary)]">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Account Settings
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Manage your profile and security preferences
            </p>
          </div>
          <button className="px-4 py-2 bg-[var(--editor-header-accent)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <Save size={16} />
            Save Changes
          </button>
        </div>

        {/* Profile Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-secondary)]">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <button className="text-sm font-medium text-[var(--editor-header-accent)] hover:underline">
                Change avatar
              </button>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                JPG, GIF or PNG. Max size of 800K
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Display Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-2.5 text-[var(--text-tertiary)]"
                  size={16}
                />
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Enter your name"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] focus:border-[var(--editor-header-accent)] focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <Globe
                  className="absolute left-3 top-2.5 text-[var(--text-tertiary)]"
                  size={16}
                />
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] focus:border-[var(--editor-header-accent)] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Integration List / Security (Placeholder) */}
        <div className="space-y-4 pt-6 border-t border-[var(--border-primary)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Security
          </h2>

          <div className="space-y-3">
            {[
              {
                icon: KeyRound,
                title: 'Password',
                desc: 'Last changed 3 months ago',
                action: 'Update',
              },
              {
                icon: Shield,
                title: 'Two-Factor Authentication',
                desc: 'Currently disabled',
                action: 'Enable',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)]">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium border border-[var(--border-secondary)] rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors">
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
