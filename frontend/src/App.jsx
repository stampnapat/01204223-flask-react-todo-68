import { BrowserRouter, Routes, Route } from "react-router-dom"
import TodoList from "./TodoList.jsx"
import "./App.css"


function App() {
  const TODOLIST_API_URL = "http://127.0.0.1:5000/api/todos/"

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<TodoList apiUrl={TODOLIST_API_URL} />}
        />

        <Route
          path="/about"
          element={
            <>
              <h1>About</h1>
              <p>
                This is a simple todo list application built with React and Flask.
              </p>
              <a href="/">Back to Home</a>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App