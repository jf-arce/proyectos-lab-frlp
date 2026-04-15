export const AuthGridContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full max-w-4xl grid md:grid-cols-2 bg-card rounded-xl shadow-[0_32px_64px_-12px_rgba(0,36,75,0.08)] overflow-hidden z-10">
      {children}
    </div>
  );
};
