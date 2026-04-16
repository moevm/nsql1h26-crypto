# Frontend UI Routes

Страницы `issue #21` открываются отдельно по URL.

Доступные маршруты:
- `/` -- техническая заглушка
- `/auth/login` -- экран логина
- `/app` -- главная страница watchlist
- `/app/favorites` -- избранные монеты
- `/app/statistics` -- статистика и пресеты
- `/app/admin/import-export` -- импорт / экспорт

Проверка error-state:
- для защищенных страниц доступен демонстрационный режим `?demo=error`
- примеры: `/app?demo=error`, `/app/favorites?demo=error`, `/app/statistics?demo=error`, `/app/admin/import-export?demo=error`

Ограничения:
- страницы открываются напрямую
- кнопки и формы в основном визуальные
- общая навигация остается для `issue #19`
