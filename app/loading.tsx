export default function GlobalLoading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-seneca-crimson via-seneca-amber to-seneca-crimson w-full animate-pulse" />
    </div>
  );
}
