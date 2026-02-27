from http import HTTPStatus

def test_get_empty_todo_items(client):
    response = client.get('/api/todos/')
    assert response.status_code == HTTPStatus.OK
    assert response.get_json() == []

    response = client.get('/api/todos/')
    assert response.status_code == HTTPStatus.OK
    assert response.get_json() == [todo.to_dict() for todo in sample_todo_items]  # ไล่ดู todo ในรายการ sample_todo_items