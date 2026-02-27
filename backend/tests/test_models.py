from http import HTTPStatus
from models import User, TodoItem, Comment, db

def test_check_correct_password():
    user = User()
    user.set_password("testpassword")
    assert user.check_password("testpassword") == True

def test_check_incorrect_password():
    user = User()
    user.set_password("testpassword")
    assert user.check_password("testpassworx") == False




import pytest
from flask import g
from flask_jwt_extended.config import config

@pytest.fixture(autouse=True)
def no_jwt(monkeypatch):
    # from https://github.com/vimalloc/flask-jwt-extended/issues/171
    def no_verify(*args, **kwargs):
        g._jwt_extended_jwt = {
            config.identity_claim_key: 'test_user'
        }

    from flask_jwt_extended import view_decorators

    monkeypatch.setattr(view_decorators, 'verify_jwt_in_request', no_verify)



def test_empty_todoitem(app_context):
    assert TodoItem.query.count() == 0


def create_todo_item_1():
    todo = TodoItem(title='Todo with comments', done=True)
    comment = Comment(message='Nested', todo=todo)
    db.session.add_all([todo, comment])
    db.session.commit()
    return todo

def test_todo_to_dict_includes_nested_comments(app_context):
    todo = create_todo_item_1()
    id = todo.id

    test_todo = TodoItem.query.get(id)
    assert len(test_todo.comments) == 1


def create_todo(title='Sample todo', done=False):
    todo = TodoItem(title=title, done=done)
    db.session.add(todo)
    db.session.commit()
    return todo

@pytest.fixture
def sample_todo_items(app_context):
    todo1 = create_todo(title='Todo 1', done=False)
    todo2 = create_todo(title='Todo 2', done=True)
    return [todo1, todo2]

def test_get_sample_todo_items(client, app_context):
    todo1 = create_todo(title='Todo 1', done=False)
    todo2 = create_todo(title='Todo 2', done=True)
    response = client.get('/api/todos/')
    assert response.status_code == HTTPStatus.OK
    assert response.get_json() == [todo.to_dict() for todo in [todo1, todo2]]

def test_toggle_todo_item(client, sample_todo_items):
    item1, item2 = sample_todo_items

    response = client.patch(f'/api/todos/{item1.id}/toggle/')
    assert response.status_code == HTTPStatus.OK

    data = response.get_json()
    assert data['done'] is True
    assert TodoItem.query.get(item1.id).done is True
