import { useRef, useState, useEffect } from 'react';
import { useWalletConnection } from '@solana/react-hooks';
import { Wallet, LogOut, Copy, Check, ChevronDown } from 'lucide-react';
import cn from '../utils/cn';
import { shortener } from '../utils/shortener';

export function WalletButton() {
    const { connected, connecting, connectors, connect, disconnect, wallet, isReady } =
        useWalletConnection();
    const [showPicker, setShowPicker] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        function handle(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setShowPicker(false);
                setShowMenu(false);
            }
        }
        document.addEventListener('mousedown', handle);
        return () => {
            document.removeEventListener('mousedown', handle);
            if (copyTimeoutRef.current !== null) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    const copyAddress = async () => {
        if (!wallet) return;
        await navigator.clipboard.writeText(wallet.account.address);
        setCopied(true);
        if (copyTimeoutRef.current !== null) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    };

    // Not hydrated yet (SSR guard)
    if (!isReady) {
        return (
            <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-700" />
        );
    }

    // ── Connected ─────────────────────────────────────────────────────────────
    if (connected && wallet) {
        const addr = wallet.account.address;
        return (
            <div className="relative" ref={ref}>
                <button
                    onClick={() => setShowMenu(v => !v)}
                    className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 transition-colors"
                >
                    {wallet.connector?.icon
                        ? <img src={wallet.connector.icon} className="w-5 h-5 rounded-full" alt="" />
                        : <Wallet className="w-4 h-4 text-slate-400" />}
                    <span>{shortener(addr)}</span>
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', showMenu && 'rotate-180')} />
                </button>

                {showMenu && (
                    <div className="absolute right-0 mt-1 w-52 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl z-50 overflow-hidden p-1">
                        <button
                            onClick={copyAddress}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-800 transition-colors text-slate-300"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Скопійовано!' : 'Копіювати адресу'}
                        </button>
                        <button
                            onClick={() => { void disconnect(); setShowMenu(false); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-800 transition-colors text-red-400"
                        >
                            <LogOut className="w-4 h-4" />
                            Відʼєднати
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // ── Single wallet — direct connect ────────────────────────────────────────
    if (connectors.length === 1) {
        return (
            <button
                onClick={() => void connect(connectors[0].id)}  // ← pass .id, not the object
                disabled={connecting}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
            >
                {connecting
                    ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <Wallet className="w-4 h-4" />}
                Підключити гаманець
            </button>
        );
    }

    // ── Multiple wallets — show picker dropdown ───────────────────────────────
    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setShowPicker(v => !v)}
                disabled={connecting}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
            >
                {connecting
                    ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <Wallet className="w-4 h-4" />}
                Підключити гаманець
                <ChevronDown className="w-4 h-4" />
            </button>

            {showPicker && (
                <div className="absolute right-0 mt-1 w-52 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl z-50 overflow-hidden p-1">
                    {connectors.map(c => (
                        <button
                            key={c.id}
                            onClick={() => { void connect(c.id); setShowPicker(false); }}  // ← pass c.id
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-800 transition-colors text-slate-200"
                        >
                            {c.icon && <img src={c.icon} className="w-5 h-5 rounded-full" alt="" />}
                            {c.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}