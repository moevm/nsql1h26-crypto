# nsql1h26-crypto

## Предварительная проверка заданий

<a href=" ./../../../actions/workflows/1_helloworld.yml" >![1. Согласована и сформулирована тема курсовой]( ./../../actions/workflows/1_helloworld.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/2_usecase.yml" >![2. Usecase]( ./../../actions/workflows/2_usecase.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/3_data_model.yml" >![3. Модель данных]( ./../../actions/workflows/3_data_model.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/4_prototype_store_and_view.yml" >![4. Прототип хранение и представление]( ./../../actions/workflows/4_prototype_store_and_view.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/5_prototype_analysis.yml" >![5. Прототип анализ]( ./../../actions/workflows/5_prototype_analysis.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/6_report.yml" >![6. Пояснительная записка]( ./../../actions/workflows/6_report.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/7_app_is_ready.yml" >![7. App is ready]( ./../../actions/workflows/7_app_is_ready.yml/badge.svg)</a>

Версия 1.0

## Запуск

В корне проекта
```bash
docker compose up -d
```

После запуска приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## Интеграция с CMC API

Для получения актуальных данных о криптовалюте используется API CoinMarketCap. Приложение поддерживает режим работы без API-ключа, но в таком случае будут использованы синтетические данные.
Алгоритм интеграции с CMC API:
1. Получение API-ключа: Зарегистрируйтесь на сайте CoinMarketCap и получите API-ключ для доступа к данным.
2. Выполните `cp .env.template .env` и замените текст `change_me` на полученный API-ключ в переменной `CMC_API_KEY` в файле `.env`.
3. Перезапустите приложение, чтобы изменения вступили в силу.

## Данные для входа
- Администратор: `admin` / `Admin123!`
- Пользователь: `user1` / `User123!`
- Пользователь: `user2` / `User123!`
