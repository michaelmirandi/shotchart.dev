import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg">
            shotchart<span className="text-orange-500">.dev</span>
          </Link>
          <nav className="flex gap-6 text-sm text-neutral-700">
            <Link
              to="/halfcourt"
              className="hover:text-black"
              activeProps={{ className: "text-black font-medium" }}
            >
              Halfcourt
            </Link>
            <Link
              to="/zoned-shotchart"
              className="hover:text-black"
              activeProps={{ className: "text-black font-medium" }}
            >
              Zoned shotchart
            </Link>
            <a
              href="https://github.com/michaelmirandi/shotchart.d3.ts"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 text-xs text-neutral-500">
        <div className="max-w-5xl mx-auto px-6 py-4">
          Live demos for{" "}
          <a
            href="https://www.npmjs.com/package/shotchart.d3.ts"
            className="underline hover:text-black"
          >
            shotchart.d3.ts
          </a>
        </div>
      </footer>
    </div>
  );
}
