interface AuthCardProps {
  titleId: string;
  title: string;
  body?: string;
  children: React.ReactNode;
}

export function AuthCard({ titleId, title, body, children }: AuthCardProps) {
  return (
    <section className="bg-canvas-alt">
      <div className="container-site py-16 md:py-24">
        <section aria-labelledby={titleId} className="mx-auto max-w-lg rounded-2xl border border-line bg-canvas p-6 shadow-raise sm:p-8 lg:p-10">
          <h2 id={titleId} className="text-2xl font-bold text-ink">{title}</h2>
          {body && <p className="mt-2 leading-relaxed text-ink-muted">{body}</p>}
          {children}
        </section>
      </div>
    </section>
  );
}
