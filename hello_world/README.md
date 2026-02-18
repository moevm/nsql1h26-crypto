# Задание 1

Тема: 37 Криптовалюты

## Скринкаст

По [ссылке](https://disk.yandex.ru/i/zM0M_ifTzzxWNQ)

## Запуск

1. Установить Docker
2. Склонировать репозиторий
3. Запустить контейнеры с помощью команды `docker compose up -d`

## Используемые в проекте технологии

Backend:

- Java
- Spring Boot
- Spring Data MongoDB
- Spring Web (REST)
- Gradle
- MongoDB

Frontend:

- TypeScript
- Next.js
- Axios

Database:

- MongoDB

Deployment:

- Docker

## Видение проекта

Веб-приложение для мониторинга криптовалют с возможностью:
- автоматической загрузки данных из CoinMarketCap
- экспорт/импорт базы данных в файл/из файла
- хранения истории цен
- отображения аналитики и дешбордов

Коллекции:
- coins_meta
  - symbol - тикер
  - name - полное название
  - cmcId - id из CoinMarketCap
  - lastUpdated - дата последнего обновления
- coin_snapshots
  - symbol - тикер
  - timestamp - дата и время снимка
  - price - цена
  - marketCap - капитализация
  - volume24h - объем торгов за 24 часа
  - percentChange24h - изменение цены за 24 часа


