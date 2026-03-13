export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-destructive mb-4 text-6xl font-bold">403</h1>
        <h2 className="mb-2 text-2xl font-semibold">Access Forbidden</h2>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have permission to access this page.
        </p>
        <a
          href="/dashboard"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
        >
          Go to Dashboard
        </a>
      </div>
    </main>
  );
}
