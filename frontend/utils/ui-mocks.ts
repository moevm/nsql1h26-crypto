import type { AppNavItem, FavoriteRow, StatisticsPreset, WatchlistRow } from "@/types/ui";

export const appNavItems: AppNavItem[] = [
  { key: "coins", label: "Монеты" },
  { key: "favorites", label: "Избранное" },
  { key: "statistics", label: "Статистика" },
  { key: "importExport", label: "Импорт / экспорт" }
];

export const watchlistRows: WatchlistRow[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$67,245.00",
    change: "+2.4%",
    cap: "$1.32T",
    volume: "$28.1B",
    favorite: true
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: "$3,521.40",
    change: "-1.1%",
    cap: "$423B",
    volume: "$15.4B",
    favorite: false
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: "$148.92",
    change: "+5.7%",
    cap: "$64B",
    volume: "$3.2B",
    favorite: true
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: "$0.62",
    change: "+0.8%",
    cap: "$22B",
    volume: "$890M",
    favorite: false
  }
];

export const favoriteRows: FavoriteRow[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$67,245.00",
    change: "+2.4%",
    cap: "$1.32T",
    volume: "$28.1B"
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: "$148.92",
    change: "+5.7%",
    cap: "$64B",
    volume: "$3.2B"
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    price: "$18.14",
    change: "-0.4%",
    cap: "$10.9B",
    volume: "$410M"
  }
];

export const statisticsPresets: StatisticsPreset[] = [
  {
    name: "Пример сохраненной конфигурации",
    symbols: "BTC, ETH, SOL",
    range: "30 дней",
    aggregation: "По дням"
  }
];
