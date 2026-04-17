# Frontend

## Маршруты

- `/` -- ведет в `/app`, если сессия есть, и в `/auth/login`, если сессии нет
- `/auth/login` -- логин
- `/auth/register` -- регистрация
- `/app` -- главная страница watchlist
- `/app/favorites` -- избранные монеты
- `/app/statistics` -- статистика и пресеты
- `/app/admin/import-export` -- импорт / экспорт

## Режимы API

Используется один публичный переключатель:

- `NEXT_PUBLIC_API_MODE=mock|backend`

Для backend-режима нужна переменная окружения:

- `BACKEND_API_ORIGIN=http://localhost:8080`

Или, для Docker-сети:

- `BACKEND_API_ORIGIN=http://backend:8080`

Важно:

- `BACKEND_API_ORIGIN` читается на стороне Next.js
- после изменения env нужно перезапустить frontend

## Проверка error-state

- для защищенных страниц доступен демонстрационный режим `?demo=error`
- примеры: `/app?demo=error`, `/app/favorites?demo=error`, `/app/statistics?demo=error`, `/app/admin/import-export?demo=error`
