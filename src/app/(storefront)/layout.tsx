export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[430px] mx-auto min-h-screen relative bg-background shadow-2xl overflow-x-clip flex flex-col">
      {children}
    </div>
  );
}
