# Система управління інвестиціями

Full-stack веб-застосунок для відстеження особистих інвестицій та управління портфелем.

Розроблено на **React** (frontend) + **Nest.js** (backend) в рамках університетського курсового проєкту.

---

## Технологічний стек

| Рівень | Технологія |
|--------|-----------|
| Backend | Node.js, Nest.js, TypeScript |
| Frontend | React (Vite), TypeScript |
| Тестування API | Bruno / Postman / cURL |
| Контроль версій | Git + GitHub |

---

## Структура репозиторію

```
investment_management_system/
├── backend/      # REST API на Nest.js
├── frontend/     # React SPA (буде додано)
└── README.md
```

---

## Сутності

### Користувач (User)
| Поле | Тип | Опис |
|------|-----|------|
| id | number | Унікальний ідентифікатор |
| name | string | Повне ім'я |
| email | string | Електронна пошта |
| riskProfile | enum | conservative / moderate / aggressive |
| createdAt | string | Дата створення (ISO) |

### Інвестиція (Investment)
| Поле | Тип | Опис |
|------|-----|------|
| id | number | Унікальний ідентифікатор |
| userId | number | Посилання на власника |
| asset | string | Назва активу (напр. Apple Inc.) |
| type | enum | stock / bond / crypto / real_estate / etf |
| amount | number | Загальна сума інвестиції (USD) |
| purchasePrice | number | Ціна на момент покупки |
| currentPrice | number | Поточна ринкова ціна |
| quantity | number | Кількість одиниць |
| purchaseDate | string | Дата покупки (ISO) |
| notes | string? | Нотатки (необов'язково) |

---

## Ендпоінти API

### Користувачі
| Метод | Ендпоінт | Опис |
|-------|----------|------|
| GET | /users | Отримати всіх користувачів |
| GET | /users/:id | Отримати користувача за ID |
| POST | /users | Створити нового користувача |
| DELETE | /users/:id | Видалити користувача |

### Інвестиції
| Метод | Ендпоінт | Опис |
|-------|----------|------|
| GET | /investments | Отримати всі інвестиції |
| GET | /investments/:id | Отримати інвестицію за ID |
| GET | /investments/user/:userId | Отримати інвестиції користувача |
| GET | /investments/user/:userId/summary | Отримати зведення по портфелю |
| POST | /investments | Створити нову інвестицію |
| DELETE | /investments/:id | Видалити інвестицію |

---

## Запуск проєкту

```bash
# Клонувати репозиторій
git clone https://github.com/YOUR_USERNAME/investment_management_system.git
cd investment_management_system/backend

# Встановити залежності
npm install

# Запустити сервер розробки
npm run start:dev

# API доступне за адресою
http://localhost:3000
```

---

## 📅 Щоденник розробки

### ✅ День 1 — Backend основа
**Дата:** 13.04.2026

**Завдання:**
- [x] Обрати тему проєкту: Система управління інвестиціями
- [x] Ініціалізувати Nest.js проєкт через CLI
- [x] Спроєктувати сутності та ендпоінти
- [x] Створити структуру модулів, контролерів, сервісів
- [x] Реалізувати in-memory сховище (масиви) для Users та Investments
- [x] Реалізувати GET та POST ендпоінти
- [x] Перевірити роботу API через Bruno

**Що було зроблено:**
- Ініціалізовано Nest.js backend за допомогою `@nestjs/cli`
- Створено два ресурсні модулі: `users` та `investments`
- Реалізовано in-memory сховище з початковими даними (seed data)
- Побудовано REST ендпоінти: GET all, GET by ID, POST, DELETE
- Додано ендпоінт зведення портфелю (`/investments/user/:id/summary`) з розрахунком загальних інвестицій, поточної вартості та прибутку/збитку
- Всі ендпоінти успішно протестовані через Bruno (відповіді 200/201)

---

### 🔜 День 2 — Валідація та обробка помилок
> _Буде додано..._

---

### 🔜 День 3 — Налаштування Frontend
> _Буде додано..._

---

### 🔜 День 4 — Функціонал Frontend
> _Буде додано..._

---

### 🔜 День 5 — Фінальне доопрацювання
> _Буде додано..._