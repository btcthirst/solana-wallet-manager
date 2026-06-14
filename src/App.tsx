import { Dashboard } from "./components/Dashboard";
import { WalletButton } from "./components/WalletButton";

export default function App() {

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg1 text-foreground">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col gap-10 border-x border-border-low px-6 py-16">
        <header className="space-y-3 flex flex-row items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Solana Wallet Manager</h1>
          <WalletButton />
        </header>

        <section className="w-full max-w-3xl space-y-4 rounded-2xl border border-border-low bg-card p-6 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.35)]">
          <Dashboard />
        </section>

      </main>
    </div>
  );
}
