from flask import Flask, render_template, request, jsonify
from sqlalchemy import func
from models import db, Expense

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///expenses.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

with app.app_context():
    db.create_all()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/expenses", methods=["GET"])
def list_expenses():
    category = request.args.get("category")
    query = Expense.query
    if category:
        query = query.filter(Expense.category == category)
    expenses = query.order_by(Expense.created_at.desc()).all()
    return jsonify([e.to_dict() for e in expenses])


@app.route("/api/expenses", methods=["POST"])
def create_expense():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    amount = data.get("amount")
    category = (data.get("category") or "other").strip().lower()

    if not title:
        return jsonify({"error": "title is required"}), 400
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify({"error": "amount must be a number"}), 400
    if amount <= 0:
        return jsonify({"error": "amount must be positive"}), 400

    expense = Expense(title=title, amount=amount, category=category)
    db.session.add(expense)
    db.session.commit()
    return jsonify(expense.to_dict()), 201


@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    expense = db.session.get(Expense, expense_id)
    if not expense:
        return jsonify({"error": "not found"}), 404
    db.session.delete(expense)
    db.session.commit()
    return "", 204


@app.route("/api/stats", methods=["GET"])
def stats():
    # Агрегация SQL: сумма по категориям
    rows = (
        db.session.query(
            Expense.category,
            func.sum(Expense.amount).label("total"),
        )
        .group_by(Expense.category)
        .all()
    )
    by_category = [{"category": r.category, "total": round(r.total, 2)} for r in rows]

    total = db.session.query(func.coalesce(func.sum(Expense.amount), 0)).scalar()

    return jsonify({
        "total": round(total, 2),
        "by_category": by_category,
    })


if __name__ == "__main__":
    app.run(debug=True)
