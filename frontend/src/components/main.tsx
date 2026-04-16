export const Main = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="container mx-auto px-4 md:px-6 py-8 max-w-275">
      {children}
    </main>
  );
};
