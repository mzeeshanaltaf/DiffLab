export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-4 sm:px-6">{children}</div>;
}
