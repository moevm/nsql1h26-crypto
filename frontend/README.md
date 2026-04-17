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

`NEXT_PUBLIC_API_MODE` обязательна. Если она не задана, frontend завершится с ошибкой сразу.

Для backend-режима нужна переменная окружения на стороне Next.js:

- `BACKEND_API_ORIGIN=http://localhost:8080`

Или, для Docker-сети:

- `BACKEND_API_ORIGIN=http://backend:8080`

Важно:

- `BACKEND_API_ORIGIN` читается на стороне Next.js
- `BACKEND_API_ORIGIN` нужна только в `backend`-режиме
- в backend-режиме браузер обращается только к /api/* на том же адресе сайта, а Next.js пересылает запросы дальше
- после изменения env нужно перезапустить frontend
