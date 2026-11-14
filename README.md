# Expense Tracker

A full-stack web application for tracking personal expenses, with a
doughnut chart that visualises spending by category. Built with Flask,
SQLAlchemy, and vanilla JavaScript — no build step required.

## Tech Stack

- **Backend:** Python 3.10+, Flask 3.0, Flask-SQLAlchemy 3.1
- **Database:** SQLite (via SQLAlchemy ORM)
- **Frontend:** HTML5, CSS3, vanilla JavaScript (Fetch API)
- **Charting:** Chart.js 4 (loaded via CDN)

## Features

- **Add expenses** — title, amount, category.
- **Categories** — Food, Transport, Housing, Entertainment, Health, Other.
- **Delete expenses** — one click to remove.
- **Filter by category** — toggle the list to a single category.
- **Live statistics** — total spending and a doughnut chart by category.
- **SQL aggregation** — totals are computed server-side with `SUM` + `GROUP BY`.
- **Server-side validation** — rejects empty titles, non-numeric, and
  non-positive amounts.
- **XSS protection** — user input is escaped before rendering.

## Project Structure

    expense-tracker/
    ├── app.py
    ├── models.py
    ├── requirements.txt
    ├── README.md
    └── static/
        ├── index.html
        ├── style.css
        └── app.js

## Getting Started

1. Clone the repository:

       git clone https://github.com/<your-username>/expense-tracker.git
       cd expense-tracker

2. Create a virtual environment:

       python -m venv venv
       source venv/bin/activate      # Linux / macOS
       venv\Scripts\activate         # Windows

3. Install dependencies:

       pip install -r requirements.txt

4. Run the app:

       python app.py

5. Open http://127.0.0.1:5000

The database `expenses.db` is created automatically on first launch.

## API

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/`                   | Serve the frontend (HTML)          |
| GET    | `/api/expenses`       | List expenses (optional `?category=`) |
| POST   | `/api/expenses`       | Create an expense                  |
| DELETE | `/api/expenses/{id}`  | Delete an expense                  |
| GET    | `/api/stats`          | Total and per-category aggregation |

### Example: create an expense

    curl -X POST http://127.0.0.1:5000/api/expenses \
      -H "Content-Type: application/json" \
      -d '{"title": "Coffee", "amount": 4.5, "category": "food"}'

## What This Project Demonstrates

- REST API design with **input validation** and proper status codes.
- **SQL aggregation** with `SUM`, `GROUP BY`, and `coalesce` through
  SQLAlchemy.
- **Data visualisation** on the client using Chart.js.
- Dynamic filtering and rendering with plain JavaScript.
- Clean separation of models, routes, and static assets.

## Possible Extensions

- Edit existing expenses.
- Date range filter (weekly / monthly stats).
- Income vs. expense mode.
- Budget limits per category with alerts.
- User accounts and authentication.
- Export to CSV / JSON.

## License

MIT
