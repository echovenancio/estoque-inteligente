from fastapi import FastAPI
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

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
    data = {
        "nm_produto": "Açucar",
        "quantidade": 0,
        "status": "A"
    }
    header = {
        "Authorization": "Bearer faketoken"
    }
    response = client.post("/estoque", json=data, headers=header)
    assert response.status_code == 200
    

def test_update_estoque():
    pass

def test_estoque():
    pass

def test_get_produto():
    pass

