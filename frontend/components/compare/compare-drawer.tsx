import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

import { coinsService } from "@/services/coins/coins-service";
import type { WatchlistCoin } from "@/types/coins";

interface CompareDrawerProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CompareDrawer = ({ symbol, isOpen, onClose }: CompareDrawerProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultList, setDefaultList] = useState<WatchlistCoin[]>([]);
  const [searchResults, setSearchResults] = useState<WatchlistCoin[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    coinsService
      .getWatchlist({ pageSize: 50 })
      .then((r) => {
        const sorted = [...r.coins].sort((a, b) => (b.volume24hUsd ?? 0) - (a.volume24hUsd ?? 0));
        setDefaultList(sorted);
      })
      .catch(() => setDefaultList([]));
  }, [isOpen]);

  const onSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!query.trim()) { setSearchResults([]); return; }
      timeoutRef.current = setTimeout(() => {
        coinsService
          .searchCoins({ query })
          .then((r) => setSearchResults(r.coins.filter((c) => c.symbol !== symbol && !selected.includes(c.symbol))))
          .catch(() => setSearchResults([]));
      }, 300);
    },
    [symbol, selected]
  );

  const onAdd = useCallback((s: string) => {
    setSelected((prev) => (prev.includes(s) ? prev : [...prev, s]));
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const onRemove = useCallback((s: string) => {
    setSelected((prev) => prev.filter((x) => x !== s));
  }, []);

  const onGo = useCallback(() => {
    const withParam = selected.join(",");
    void router.push(`/app/compare/${symbol}${withParam ? `?with=${withParam}` : ""}`);
    onClose();
  }, [router, symbol, selected, onClose]);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSelected([]);
    onClose();
  }, [onClose]);

  const visibleList = searchQuery.trim()
    ? searchResults
    : defaultList.filter((c) => c.symbol !== symbol && !selected.includes(c.symbol));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-border shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--overlay-strong)", backdropFilter: "blur(18px)" }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <p className="cw-kicker">Сравнение</p>
            <p className="text-sm font-semibold" translate="no">{symbol}</p>
          </div>
          <button
            type="button"
            className="cw-button-secondary px-2 py-1 text-base"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((s) => (
                <span key={s} className="flex items-center gap-1 rounded-full border border-border bg-accent px-3 py-1 text-sm">
                  <span translate="no">{s}</span>
                  <button
                    type="button"
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => onRemove(s)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            className="cw-input w-full"
            placeholder="Поиск тикера..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && visibleList.length > 0) {
                e.preventDefault();
                onAdd(visibleList[0].symbol);
              }
            }}
            autoComplete="off"
          />

          {visibleList.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {visibleList.slice(0, 12).map((coin) => (
                <li key={coin.symbol}>
                  <button
                    type="button"
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => onAdd(coin.symbol)}
                  >
                    <span className="font-medium" translate="no">{coin.symbol}</span>
                    <span className="ml-2 text-muted-foreground">{coin.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-4">
          <button
            type="button"
            className="cw-button-primary w-full"
            disabled={selected.length === 0}
            onClick={onGo}
          >
            Перейти к сравнению
          </button>
        </div>
      </div>
    </>
  );
};
