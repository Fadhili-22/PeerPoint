export default function StaticContentPage({ title, children }) {
  return (
    <section className="bg-surface-muted py-24">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-10">
        <div className="mb-12 space-y-4 text-center">
          <h1 className="font-heading text-3xl font-semibold text-on-surface">
            {title}
          </h1>
          <div
            className="mx-auto h-1.5 w-24 rounded-full bg-primary"
            aria-hidden="true"
          />
        </div>
        <article className="mx-auto max-w-3xl space-y-6 rounded-[32px] border border-transparent bg-surface p-10 shadow-sm">
          {children}
        </article>
      </div>
    </section>
  );
}
