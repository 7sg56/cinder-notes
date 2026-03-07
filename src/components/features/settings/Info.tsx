import { Github, ExternalLink, Mail, Info as InfoIcon } from 'lucide-react';

export function Info() {
  return (
    <div className="flex-1 overflow-y-auto w-full h-full p-8 no-scrollbar bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] shadow-sm">
              <InfoIcon
                size={28}
                className="text-[var(--editor-header-accent)]"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                About Cinder Notes
              </h1>
              <p className="mt-1 text-[var(--text-secondary)]">
                The minimalist, distraction-free markdown powerhouse.
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                What is Cinder?
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                Cinder Notes is a high-performance markdown editor designed for
                speed and focus. Built with a "less is more" philosophy, it
                provides a clean canvas for your thoughts while keeping powerful
                tools just a click away in the Floating Hub.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                Core Philosophy
              </h2>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--editor-header-accent)] mt-1.5 shrink-0" />
                  <span>Personalized through themes, not bloat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--editor-header-accent)] mt-1.5 shrink-0" />
                  <span>Privacy first: Your notes stay on your machine.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--editor-header-accent)] mt-1.5 shrink-0" />
                  <span>Native performance with lightweight components.</span>
                </li>
              </ul>
            </section>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] space-y-4">
              <h3 className="font-semibold text-[var(--text-primary)]">
                Resources
              </h3>

              <div className="space-y-2">
                <a
                  href="https://github.com/aurelius-labs/cinder-notes"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Github
                      size={18}
                      className="text-[var(--text-secondary)]"
                    />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      GitHub Repository
                    </span>
                  </div>
                  <ExternalLink
                    size={14}
                    className="opacity-0 group-hover:opacity-100 text-[var(--text-tertiary)] transition-opacity"
                  />
                </a>

                <a
                  href="https://cinder-notes.com/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink
                      size={18}
                      className="text-[var(--text-secondary)]"
                    />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Documentation
                    </span>
                  </div>
                  <ExternalLink
                    size={14}
                    className="opacity-0 group-hover:opacity-100 text-[var(--text-tertiary)] transition-opacity"
                  />
                </a>
              </div>
            </div>

            <div className="p-6 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)]">
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                Connect
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                Have feedback or want to request a feature? We'd love to hear
                from you.
              </p>
              <button className="w-full py-2.5 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-sm font-medium text-[var(--text-primary)] flex items-center justify-center gap-2 hover:bg-[var(--bg-hover)] transition-colors">
                <Mail size={16} />
                Contact Team
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-[var(--border-primary)] text-center">
          <p className="text-xs text-[var(--text-tertiary)]">
            Cinder Notes v1.0.0 &bull; Built with focus by Aurelius Labs
          </p>
        </div>
      </div>
    </div>
  );
}
