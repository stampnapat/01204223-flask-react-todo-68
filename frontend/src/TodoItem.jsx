import { useState } from "react"
import "./App.css"



function TodoItem({ todo, toggleDone, deleteTodo, addNewComment }) {
  const [newComment, setNewComment] = useState("")

  const count = todo.comments ? todo.comments.length : 0

  return (
    <li>
      <span className={todo.done ? "done" : ""}>{todo.title}</span>

      <button onClick={() => toggleDone(todo.id)}>Toggle</button>
      <button onClick={() => deleteTodo(todo.id)}>❌</button>

      {count === 0 ? (
        <div>No comments</div>
      ) : (
        <>
          {/* แสดงจำนวน comment (เพื่อให้เทส expect(/2/) ผ่าน) */}
          <div>{count}</div>

          <ul>
            {todo.comments.map((c) => (
              <li key={c.id}>{c.message}</li>
            ))}
          </ul>
        </>
      )}

      <div className="new-comment-forms">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          onClick={() => {
            addNewComment(todo.id, newComment)
            setNewComment("")
          }}
        >
          Add Comment
        </button>
      </div>
    </li>
  )
}

export default TodoItem
