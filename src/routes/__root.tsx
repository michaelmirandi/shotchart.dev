import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { MobileBar, Sidebar } from "../components/Sidebar";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-canvas text-fg lg:grid lg:grid-cols-[15rem_1fr]">
      <Sidebar />
      <div className="min-w-0">
        <MobileBar />
        <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-12 lg:py-14">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-fg-muted">
        There is nothing at this address.{" "}
        <Link to="/" className="text-fg underline underline-offset-4">
          Back to the docs
        </Link>
        .
      </p>
    </div>
  );
}
