from fastapi import FastAPI
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

test_id = ""

header = {
    "Authorization": "Bearer faketoken"
}

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}

def test_login():
    # Teste email e senha incorretos
    data = {
        "email": "email@errado",
        "password": "12345678", 
    } 
    response = client.post("/login", json=data)
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password"}
    # Teste email e senha corretos
    data = {
        "email": "loja@email.com",
        "password": "123456", 
    } 
    response = client.post("/login", json=data)
    print(response)
    assert response.status_code == 200
    assert response.json() == {
      "kind": "identitytoolkit#VerifyPasswordResponse",
      "localId": "fakeid",
      "email": "loja@email.com",
      "displayName": "loja@email.com",
      "idToken": "faketoken",
      "registered": True,
      "refreshToken": "fakerefreshtoken",
      "expiresIn": "3600"
    }

def test_add_estoque():
    datas = [
        {
            "nm_produto": "Açucar",
            "quantidade": 1,
            "labels": ["doce"],
        },
        {
            "nm_produto": "Arroz",
            "quantidade": 2,
            "labels": ["salgado", "doce"],
        },
        {
            "nm_produto": "Feijão",
            "quantidade": 3,
            "labels": ["salgado"],
        }
    ]
    for data in datas:
        response = client.post("/estoque", json=data, headers=header)
        assert response.status_code == 200
        json = response.json()
        assert json["nm_produto"] == data["nm_produto"]
        assert json["quantidade"] == data["quantidade"]
        assert json["labels"] == data["labels"]
        assert len(json["id"]) > 0 
        global test_id
        test_id = json["id"]
    assert test_id != ""

def test_estoque():
    response = client.get("/estoque", headers=header)
    assert response.status_code == 200
    json = response.json()
    print(json)
    assert len(json) == 3

def test_update_estoque():
    data = {
        "nm_produto": "Bolo",
        "quantidade": 3,
        "labels": ["doce"],
    }
    response = client.put(f"/estoque/{test_id}", json=data, headers=header)
    assert response.status_code == 200
    json = response.json()
    assert json["nm_produto"] == data["nm_produto"]
    assert json["quantidade"] == data["quantidade"]
    assert json["labels"] == data["labels"]

def test_get_produto():
    response = client.get(f"/estoque/{test_id}", headers=header)
    assert response.status_code == 200
    json = response.json()
    assert json["id"] == test_id
