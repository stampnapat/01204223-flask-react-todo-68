from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate

from models import TodoItem, Comment, db


app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
# ]}})

CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})


app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///todos.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
migrate = Migrate(app, db)


@app.route("/api/todos/", methods=["GET"])
def get_todos():
    todos = TodoItem.query.all()
    return jsonify([todo.to_dict() for todo in todos])


def new_todo(data):
    return TodoItem(
        title=data["title"],
        done=data.get("done", False),
    )


@app.route("/api/todos/", methods=["POST"])
def add_todo():
    data = request.get_json()
    todo = new_todo(data)

    if todo:
        db.session.add(todo)
        db.session.commit()
        return jsonify(todo.to_dict())
    else:
        return (jsonify({"error": "Invalid todo data"}), 400)


@app.route("/api/todos/<int:id>/toggle/", methods=["PATCH"])
def toggle_todo(id):
    todo = TodoItem.query.get_or_404(id)
    todo.done = not todo.done
    db.session.commit()
    return jsonify(todo.to_dict())


# @app.route("/api/todos/<int:id>/", methods=["DELETE"])
# def delete_todo(id):
#     todo = TodoItem.query.get_or_404(id)
#     db.session.delete(todo)
#     db.session.commit()
#     return jsonify({"message": "Todo deleted successfully"})

@app.route("/api/todos/<int:id>/", methods=["DELETE"])
def delete_todo(id):
    todo = TodoItem.query.get_or_404(id)

    # ลบ comments ที่ผูกกับ todo นี้ก่อน (กัน FK ตีกลับ)
    Comment.query.filter_by(todo_id=id).delete()

    db.session.delete(todo)
    db.session.commit()
    return jsonify({"message": "Todo deleted successfully"})



@app.route("/api/todos/<int:todo_id>/comments/", methods=["POST"])
def add_comment(todo_id):
    todo_item = TodoItem.query.get_or_404(todo_id)

    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Comment message is required"}), 400

    comment = Comment(
        message=data["message"],
        todo_id=todo_item.id,
    )
    db.session.add(comment)
    db.session.commit()

    return jsonify(comment.to_dict())
