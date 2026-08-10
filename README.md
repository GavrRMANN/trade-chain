# xakaton_avito

## Запуск

```bash
docker compose up --build
```

Compose поднимает PostgreSQL (`localhost:5432`), API (`http://localhost:8080`) и frontend (`http://localhost:3000`). При первом создании тома PostgreSQL применяет миграции и заполняет таблицы данными из `front/mock-api/data.js`.

Тестовые пользователи используют пароль `password123` (например, `alexey@example.com`).

После изменения mock-данных обновите сид и пересоздайте том базы:

```bash
node scripts/generate-mock-seed.mjs
docker compose down -v
docker compose up --build
```

Полный сброс локальной базы:

```bash
docker compose down -v
```

<h1>Вклад каждого члена команды</h1>
<div>
<h3>Нгуен Туан Минь</h3>
<ul>
  <li>Принимал участие в реализации идеи решения кейса</li>
  <li>Частично принимал участие в описании документации проекта - https://docs.google.com/document/d/1fi81Sybfe5A7BqMQZMJNDsi7JOvth4BI2Z1Mb4_dvcQ/edit?tab=t.0#heading=h.n9of3avfj1b1</li>
  <li>Описал API в документации</li>
  <li>С нуля вместе с Романом описали ER диаграмму для проекта, далее уже самостоятельно доделывал схему начальную (Связи) - https://miro.com/welcomeonboard/bG5tZW0zR0YyNDE0U3ZPRk9ESlVPNlNnKy91U0ZLRTNpUG95V0dKVS9Ma1NCbU8rY1pnZGUzU0pSNC8xMEpiWXVkUVpKN3JKMUVuR2g4c0pHWEttUktNZWFpejEvZVRBZjVGQnNpcWZhQlI0My9LaktkdTdQeERMM01TL1RRdmNyVmtkMG5hNDA3dVlncnBvRVB2ZXBnPT0hdjE=?share_link_id=944929119910</li>
  <li>Помогал разобраться команде с архитектурой</li>
  <li>С нуля написал начальную архитектуру для дальшейней работы с ней</li>
  <li>Занимался описание основного пользовательского сценария в BPMN-схеме, Роман на основе этой схемы создал 3 другие схемы по сценариям</li>
</ul>
<h4>По коду (Backend) - Второстепенная роль (Основной Backend'ер Роман)</h4>
  <ul>
    <li>С нуля написал слой DTO, Repository, Services, Routers (Этим также занимался Роман)</li>
    <li>Занимался описание ручек в Swagger для удобства тестирования</li>
    <li>Отвечал за логику регистрации, написал авторизацию по JWT</li>
    <li>Помогал в реализации логики создания объявлений - Добавить фото, новые поля для таблицы</li>
  </ul>
<h4>По тестированию</h4>
  <ul>
    <li>Занимался тестированием финального продукта путем регрессионого тестирования</li>
    <li>Писал баг-репорты после регресса</li>
  </ul>
</div>
