from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

test_id = ""

header = {"Authorization": "Bearer faketoken"}


def test_login():
    # Teste email e senha incorretos
    data = {
        "email": "email@errado",
        "password": "12345678",
    }
    response = client.post("/v1/login", json=data)
    assert response.status_code == 401
    assert response.json() == {"detail": "Email ou senha inválido"}
    # Teste email e senha corretos
    data = {
        "email": "loja@email.com",
        "password": "123456",
    }
    response = client.post("/v1/login", json=data)
    assert response.status_code == 200
    assert response.json() == {
        "kind": "identitytoolkit#VerifyPasswordResponse",
        "localId": "fakeid",
        "email": "loja@email.com",
        "displayName": "loja@email.com",
        "idToken": "faketoken",
        "registered": True,
        "refreshToken": "fakerefreshtoken",
        "expiresIn": "3600",
    }


def test_add_estoque():
    datas = [
        {
            "nm_produto": "Açucar",
            "type_quantidade": "GR",
            "val_quantidade": 10,
            "min_quantity": 5,
            "labels": ["doce"],
            "anotation": "Açucar refinado",
        },
        {
            "nm_produto": "Arroz",
            "type_quantidade": "KG",
            "val_quantidade": 1,
            "min_quantity": 2,
            "labels": ["salgado", "doce"],
            "anotation": "Arroz branco",
        },
        {
            "nm_produto": "Bolo de chocolate",
            "type_quantidade": "UN",
            "val_quantidade": 1,
            "min_quantity": 0,
            "labels": ["doce", "chocolate"],
            "anotation": "Um bolo de chocolate",
        },
    ]
    for data in datas:
        response = client.post("/v1/estoque", json=data, headers=header)
        assert response.status_code == 200
        json = response.json()
        assert json["nm_produto"] == data["nm_produto"]
        assert json["labels"] == data["labels"]
        assert json["anotation"] == data["anotation"]
        assert json["type_quantidade"] == data["type_quantidade"].lower()
        assert json["val_quantidade"] == data["val_quantidade"]
        assert json["min_quantity"] == data["min_quantity"]
        assert json["cluster_id"] == -1
        assert len(json["id"]) > 0
        global test_id
        test_id = json["id"]
    assert test_id != ""


def test_estoque():
    response = client.get("/v1/estoque", headers=header)
    assert response.status_code == 200
    json = response.json()
    assert len(json) == 3


def test_update_estoque():
    data = {
        "nm_produto": "Bolo",
        "type_quantidade": "UN",
        "val_quantidade": 1,
        "min_quantity": 3,
        "labels": ["doce"],
        "anotation": "Bolo qualquer",
    }
    response = client.put(f"/v1/estoque/{test_id}", json=data, headers=header)
    assert response.status_code == 200
    json = response.json()
    assert json["nm_produto"] == data["nm_produto"]
    assert json["type_quantidade"] == data["type_quantidade"].lower()
    assert json["val_quantidade"] == data["val_quantidade"]
    assert json["min_quantity"] == data["min_quantity"]
    assert json["labels"] == data["labels"]
    assert json["anotation"] == data["anotation"]


def test_get_produto():
    response = client.get(f"/v1/estoque/{test_id}", headers=header)
    assert response.status_code == 200
    json = response.json()
    assert json["id"] == test_id


def test_get_categoria():
    response = client.get("/v1/categorias", headers=header)
    assert response.status_code == 200
    json = response.json()
    assert len(json) > 0
    assert "doce" in json
    assert "salgado" in json


def test_get_low_stock_estoque():
    """Test that low stock endpoint returns products with val_quantidade < min_quantity"""
    response = client.get("/v1/estoque/low-stock", headers=header)
    assert response.status_code == 200
    json = response.json()
    # Açucar: val_quantidade=10, min_quantity=5 (not low stock)
    # Arroz: val_quantidade=1, min_quantity=2 (low stock)
    # Bolo: val_quantidade=1, min_quantity=3 (low stock)
    assert len(json) >= 2
    
    # Verify that all returned products have val_quantidade < min_quantity
    for produto in json:
        assert produto["val_quantidade"] < produto["min_quantity"]
        assert produto["min_quantity"] > 0


def test_low_stock_with_zero_threshold():
    """Test that products with min_quantity=0 are not considered low stock"""
    # Get all low stock products
    response = client.get("/v1/estoque/low-stock", headers=header)
    assert response.status_code == 200
    json = response.json()
    
    # Check that no product with min_quantity=0 is in the list
    for produto in json:
        assert produto["min_quantity"] > 0


def test_min_quantity_field_present():
    """Test that min_quantity field is present in product responses"""
    response = client.get(f"/v1/estoque/{test_id}", headers=header)
    assert response.status_code == 200
    json = response.json()
    assert "min_quantity" in json
    assert isinstance(json["min_quantity"], (int, float))
