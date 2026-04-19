import { backendCoinsService } from "@/services/coins/backend-coins-service";
import { mockCoinsService } from "@/services/coins/mock-coins-service";
import type { CoinsApi } from "@/types/coins";
import { env } from "@/utils/env";

const coinsServiceByMode: Record<typeof env.apiMode, CoinsApi> = {
  mock: mockCoinsService,
  backend: backendCoinsService
};

export const coinsService = coinsServiceByMode[env.apiMode];
