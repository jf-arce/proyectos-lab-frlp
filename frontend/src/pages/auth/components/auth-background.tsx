export function AuthBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/8 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-primary/5 blur-[100px]" />
    </div>
  );
}
