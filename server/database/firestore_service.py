from config import settings
from domain.exceptions import NotFound, InternalServer, Unauthorized
from domain.models import LoginRes, ResProduto, Produto
import json
import requests
from database.generic_repository import GenericDBManager


def get_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


def load_json_produto_into_obj(json_produto):
    id = json_produto["name"].split("/")[-1]
    labels = []
    for json_label in json_produto["fields"]["labels"]["arrayValue"]["values"]:
        labels.append(json_label["stringValue"])
    val_q = json_produto["fields"]["val_quantidade"]
    print(f"val_q: {val_q}")
    val_quantidade = val_q.get("doubleValue")
    print(f"val_quantidade: {val_quantidade}")
    
    # Get min_quantity if it exists, otherwise default to 0.0
    min_q = json_produto["fields"].get("min_quantity", {})
    min_quantity = min_q.get("doubleValue", 0.0)
    if isinstance(min_quantity, str):
        min_quantity = float(min_quantity)
    
    produto = ResProduto(
        id=id,
        nm_produto=json_produto["fields"]["nm_produto"]["stringValue"],
        type_quantidade=json_produto["fields"]["type_quantidade"]["stringValue"],
        val_quantidade=val_quantidade if val_quantidade is not None else 0.0,
        min_quantity=min_quantity,
        anotation=json_produto["fields"]["anotation"]["stringValue"],
        cluster_id=json_produto["fields"]["cluster_id"]["integerValue"],
        labels=labels,
        created_at="",
        updated_at="",
    )
    return produto


class FirestoreDBManager(GenericDBManager):
    def __init__(self):
        self.firebase_project_id = settings.firebase_project_id
        self.firebase_api_key = settings.firebase_api_key
        self.firebase_auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={self.firebase_api_key}"
        self.firebase_db_url = f"https://firestore.googleapis.com/v1/projects/{self.firebase_project_id}/databases/(default)/documents/estoque"

    def __raise_exception_if_there_iserror(self, code):
        match code:
            case 400:
                raise InternalServer()
            case 401:
                raise Unauthorized()
            case 404:
                raise NotFound("Produto")
            case 500:
                raise InternalServer()

    def login(self, email, password):
        data = {"email": email, "password": password, "returnSecureToken": True}
        response = requests.post(self.firebase_auth_url, data=json.dumps(data))
        res = LoginRes.model_validate(response.json())
        return res

    def get_estoque(self, auth_token):
        headers = get_headers(auth_token)
        url = f"{self.firebase_db_url}"
        response = requests.get(url, headers=headers)
        print("Resposta", response)
        print("Resposta JSON", response.json())
        self.__raise_exception_if_there_iserror(response.status_code)
        documents = response.json()["documents"]
        estoque = []
        for document in documents:
            estoque.append(load_json_produto_into_obj(document))
        return sorted(estoque, key=lambda p: p.cluster_id)

    # Temporário, esse código é bem ridiculo mas é só pra ter algo rápido, vou refatorar isso.
    def get_categorias(self, auth_token) -> list[str]:
        produtos = self.get_estoque(auth_token)
        categorias = set()
        for produto in produtos:
            for label in produto.labels:
                categorias.add(label)
        return list(categorias)

    def get_produto(self, id, auth_token):
        headers = get_headers(auth_token)
        print(headers)
        url = f"{self.firebase_db_url}/{id}"
        response = requests.get(url, headers=headers)
        self.__raise_exception_if_there_iserror(response.status_code)
        print("Resposta", response)
        print("Resposta JSON", response.json())
        return load_json_produto_into_obj(response.json())

    def add_estoque(self, produto, auth_token):
        headers = get_headers(auth_token)
        labels = {
            "arrayValue": {
                "values": [{"stringValue": label} for label in produto.labels]
            }
        }
        request_data = {
            "fields": {
                "nm_produto": {"stringValue": produto.nm_produto},
                "type_quantidade": {"stringValue": produto.type_quantidade},
                "val_quantidade": {"doubleValue": str(produto.val_quantidade)},
                "min_quantity": {"doubleValue": str(produto.min_quantity)},
                "labels": labels,
                "anotation": {"stringValue": produto.anotation},
                "cluster_id": {"integerValue": -1},
            }
        }
        response = requests.post(
            self.firebase_db_url, data=json.dumps(request_data), headers=headers
        )
        self.__raise_exception_if_there_iserror(response.status_code)
        return load_json_produto_into_obj(response.json())

    def update_estoque(self, id, produto, auth_token):
        headers = get_headers(auth_token)
        labels = {
            "arrayValue": {
                "values": [{"stringValue": label} for label in produto.labels]
            }
        }
        request_data = {
            "fields": {
                "nm_produto": {"stringValue": produto.nm_produto},
                "type_quantidade": {"stringValue": produto.type_quantidade},
                "val_quantidade": {"doubleValue": str(produto.val_quantidade)},
                "min_quantity": {"doubleValue": str(produto.min_quantity)},
                "labels": labels,
                "anotation": {"stringValue": produto.anotation},
                "cluster_id": {"integerValue": -1},
            }
        }
        url = f"{self.firebase_db_url}/{id}"
        response = requests.patch(url, data=json.dumps(request_data), headers=headers)
        print("Resposta", response)
        print("Resposta JSON", response.json())
        self.__raise_exception_if_there_iserror(response.status_code)
        return load_json_produto_into_obj(response.json())

    def update_cluster(self, id, cluster_id, auth_token):
        print(f"Atualizando cluster do produto {id} para {cluster_id}")
        headers = get_headers(auth_token)
        request_data = {"fields": {"cluster_id": {"integerValue": str(cluster_id)}}}
        url = f"{self.firebase_db_url}/{id}?updateMask.fieldPaths=cluster_id"
        response = requests.patch(url, data=json.dumps(request_data), headers=headers)
        self.__raise_exception_if_there_iserror(response.status_code)

    def get_estoque_size(self, auth_token) -> int:
        headers = get_headers(auth_token)
        response = requests.get(self.firebase_db_url, headers=headers)
        self.__raise_exception_if_there_iserror(response.status_code)
        documents = response.json()["documents"]
        return len(documents)

    def delete_produto(self, id, auth_token) -> bool:
        headers = get_headers(auth_token)
        url = f"{self.firebase_db_url}/{id}"
        response = requests.delete(url, headers=headers)
        self.__raise_exception_if_there_iserror(response.status_code)
        return response.status_code == 200

    def get_low_stock_produtos(self, auth_token) -> list[ResProduto]:
        estoque = self.get_estoque(auth_token)
        low_stock = [
            produto
            for produto in estoque
            if produto.val_quantidade < produto.min_quantity and produto.min_quantity > 0
        ]
        return sorted(low_stock, key=lambda p: p.cluster_id)
