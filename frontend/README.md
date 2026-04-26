# Frontend

## Режимы API

- `NEXT_PUBLIC_API_MODE=mock|backend` - обязательная переменная
- `mock` - frontend работает без реального backend
- `backend` - браузер ходит только в `/api/*` на адресе frontend, а `Next.js rewrites` проксирует запросы дальше

Для `backend`-режима нужна переменная:

- `BACKEND_API_ORIGIN=http://localhost:8080`

Для Docker-сети обычно используется:

- `BACKEND_API_ORIGIN=http://backend:8080`

Важно:

- `BACKEND_API_ORIGIN` читается на стороне Next.js
- `BACKEND_API_ORIGIN` нужна только в `backend`-режиме
- после изменения env frontend нужно перезапустить или пересобрать

## Маршруты

- `/` - ведет в `/app`, если сессия есть, и в `/auth/login`, если сессии нет
- `/auth/login` - логин
- `/auth/register` - регистрация
- `/app` - главная страница watchlist
- `/app/coins/[symbol]` - страница монеты с summary, history filters, chart и table
- `/app/favorites` - избранные монеты
- `/app/statistics` - статистика и пресеты
- `/app/admin/import-export` - импорт / экспорт (только для `role=admin`)
