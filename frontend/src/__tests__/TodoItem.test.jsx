import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import TodoItem from '../TodoItem.jsx'

// ** ละส่วน import
const baseTodo = {             // ** TodoItem พื้นฐานสำหรับทดสอบ
  id: 1,
  title: 'Sample Todo',
  done: false,
  comments: [],
};

describe('TodoItem', () => {
  it('renders with no comments correctly', () => {    
    // *** โค้ดสำหรับเทสที่เพิ่มเข้ามา
    render(
      <TodoItem todo={baseTodo} />
    );
    expect(screen.getByText('Sample Todo')).toBeInTheDocument();
    expect(screen.getByText('No comments')).toBeInTheDocument();
  });

    it('renders with comments correctly', () => {
    const todoWithComment = {
      ...baseTodo,
      comments: [
        {id: 1, message: 'First comment'},
        {id: 2, message: 'Another comment'},
      ]
    };
    render(
      <TodoItem todo={todoWithComment} />
    );
        expect(screen.queryByText('No comments')).not.toBeInTheDocument();

    expect(screen.getByText('Sample Todo')).toBeInTheDocument();
    //
    // *** TODO: ให้เพิ่ม assertion ว่ามีข้อความ First comment และ Another comment บนหน้าจอ
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Another comment')).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();

  });
    it('makes callback to toggleDone when Toggle button is clicked', () => {
    const onToggleDone = vi.fn();
    render(
      <TodoItem 
       todo={baseTodo} 
       toggleDone={onToggleDone} />
    );
    const button = screen.getByRole('button', { name: /toggle/i });
    button.click();
    expect(onToggleDone).toHaveBeenCalledWith(baseTodo.id);
  });


  it('makes callback to deleteTodo when delete button is clicked', () => {
  const onDeleteTodo = vi.fn()

  render(<TodoItem todo={baseTodo} deleteTodo={onDeleteTodo} />)

  const button = screen.getByRole('button', { name: '❌' })
  button.click()

  expect(onDeleteTodo).toHaveBeenCalledWith(baseTodo.id)
})


  it('makes callback to addNewComment when a new comment is added', async () => {
    const onAddNewComment = vi.fn()

    render(<TodoItem todo={baseTodo} addNewComment={onAddNewComment} />)

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'New comment')

    const button = screen.getByRole('button', { name: /add comment/i })
    fireEvent.click(button)

    expect(onAddNewComment).toHaveBeenCalledWith(baseTodo.id, 'New comment')
  })


});