import os
import sys
import logging
import sqlite3
import requests
import json
from uuid import uuid4
from fastapi import HTTPException
from abc import ABC, abstractmethod
from dotenv import load_dotenv
from mapper import map_product_to_response

from models import LoginRes, ResProduto

load_dotenv()
env = os.getenv('ENV')

def load_json_produto_into_obj(json_produto):
    id = json_produto["name"].split("/")[-1]
    labels = []
    for json_label in json_produto["fields"]["labels"]["arrayValue"]["values"]:
        labels.append(json_label["stringValue"])
    produto = ResProduto(
        id=id, 
        nm_produto=json_produto["fields"]["nm_produto"]["stringValue"], 
        type_quantidade=json_produto["fields"]["type_quantidade"]["stringValue"],
        val_quantidade=json_produto["fields"]["val_quantidade"]["doubleValue"],
        anotation=json_produto["fields"]["anotation"]["stringValue"],
        cluster_id=json_produto["fields"]["cluster_id"]["integerValue"],
        labels=labels,
        created_at=json_produto["createTime"],
        updated_at=json_produto["updateTime"])
    return produto

def get_headers(auth_token):
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }

class GenericDBManager(ABC):
    @abstractmethod
    def login(self, email, password) -> LoginRes:
        pass

    @abstractmethod
    def get_estoque(self, auth_token) -> list[ResProduto]:
        pass

    @abstractmethod
    def get_produto(self, id, auth_token) -> ResProduto:
        pass

    @abstractmethod
    def add_estoque(self, produto, auth_token) -> ResProduto:
        pass

    @abstractmethod
    def update_estoque(self, id, produto, auth_token) -> ResProduto:
        pass

    @abstractmethod
    def get_categorias(self, auth_token) -> list[str]:
        pass

    @abstractmethod
    def get_estoque_size(self, auth_token) -> int:
        pass

    @abstractmethod
    def update_cluster(self, id, cluster_id, auth_token):
        pass

class DevDBManager(GenericDBManager):

    def __init__(self):
        pass

    def __create_dev_tables(self):
            conn = None
            if env == "test":
                self.url = "file::memory:?cache=shared"
                conn = sqlite3.connect(self.url, uri=True)
            else:
                self.url = "database.db"
                conn = sqlite3.connect(self.url)
            cursor = conn.cursor()
            cursor.execute("CREATE TABLE IF NOT EXISTS estoque (uuid TEXT, nm_produto TEXT, type_quantidade TEXT, val_quantidade REAL, labels TEXT, anotation TEXT, cluster_id INTEGER, created_at TEXT, updated_at TEXT)")
            cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, hash_password TEXT)")
            cursor.execute("INSERT OR IGNORE INTO users (id, email, hash_password) VALUES (1, 'loja@email.com', '123456')")
            cursor.execute("INSERT OR IGNORE INTO users (id, email, hash_password) VALUES (2, 'fabrica@email.com', '123456')")
            conn.commit()
            cursor.close()
            self.conn = conn

    def _get_db_conn(self):
        self.__create_dev_tables()
        if self.url == None:
            logging.error("Database URL not set")
            sys.exit(1)
        return self.conn

    def login(self, email, password):
        cursor = self._get_db_conn().cursor()
        cursor.execute("SELECT * FROM users WHERE email = ? AND hash_password = ?", (email, password))
        row = cursor.fetchone()
        if row:
            return LoginRes(
                kind="identitytoolkit#VerifyPasswordResponse",
                localId="fakeid",
                email=row[1],
                displayName=row[1],
                idToken="faketoken",
                registered=True,
                refreshToken="fakerefreshtoken",
                expiresIn="3600")
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password") 

    def get_estoque(self, auth_token) -> list[ResProduto]:
        cursor = self._get_db_conn().cursor()
        try:
            cursor.execute("SELECT * FROM estoque ORDER BY cluster_id ASC")
            rows = cursor.fetchall()
        except Exception as e:
            raise HTTPException(status_code=500, detail="Internal server error")
        produtos = []
        for row in rows:
            produtos.append(map_product_to_response(row))
        return produtos

    def get_produto(self, id, auth_token):
        cursor = self._get_db_conn().cursor()
        cursor.execute("SELECT * FROM estoque WHERE uuid = ?", (id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Produto not found")
        return map_product_to_response(row) 

    def add_estoque(self, produto, auth_token):
        uuid = str(uuid4())
        conn = self._get_db_conn()
        try:
            cursor = conn.cursor() 
            cursor.execute(
                "INSERT INTO estoque (uuid, nm_produto, type_quantidade, val_quantidade, labels, anotation, cluster_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))", 
                (uuid, produto.nm_produto, produto.type_quantidade, produto.val_quantidade, json.dumps(produto.labels), produto.anotation, -1))
            conn.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail="Internal server error")
        produto = self.get_produto(uuid, auth_token)
        return produto

    def update_estoque(self, id, produto, auth_token):
        conn = self._get_db_conn()
        try:
            cursor = conn.cursor() 
            cursor.execute(
                "UPDATE estoque SET nm_produto = ?, type_quantidade = ?, val_quantidade = ?, labels = ?, anotation = ?, updated_at = datetime('now') WHERE uuid = ?", 
                (produto.nm_produto, produto.type_quantidade, produto.val_quantidade, json.dumps(produto.labels), produto.anotation, id))
            conn.commit()
        except Exception as e:
            raise HTTPException(status_code=404, detail="Produto not found")
        produto = self.get_produto(id, auth_token)
        return produto

    # Temporário, esse código é bem ridiculo mas é só pra ter algo rápido, vou refatorar isso.
    def get_categorias(self, auth_token) -> list[str]:
        estoque = self.get_estoque(auth_token)
        categorias = set()
        for produto in estoque:
            for label in produto.labels:
                categorias.add(label)
        return list(categorias)
    
    def update_cluster(self, id, cluster_id, auth_token):
        conn = self._get_db_conn()
        try:
            cursor = conn.cursor() 
            cursor.execute(
                "UPDATE estoque SET cluster_id = ?, updated_at = datetime('now') WHERE uuid = ?",
                (cluster_id, id))
            conn.commit()
        except Exception as e:
            raise HTTPException(status_code=404, detail="Produto not found")

    def get_estoque_size(self, auth_token) -> int:
        cursor = self._get_db_conn().cursor()
        cursor.execute("SELECT COUNT(*) FROM estoque")
        row = cursor.fetchone()
        if row:
            return row[0]
        else:
            raise HTTPException(status_code=500, detail="Internal server error")


class FirestoreDBManager(GenericDBManager):
    def __init__(self):
        self.firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
        self.firebase_api_key = os.getenv("FIREBASE_API_KEY")
        self.firebase_auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={self.firebase_api_key}"
        self.firebase_db_url = f"https://firestore.googleapis.com/v1/projects/{self.firebase_project_id}/databases/(default)/documents/estoque/"

    def login(self, email, password):
            data = {
                "email": email,
                "password": password,
                "returnSecureToken": True
            }
            response = requests.post(self.firebase_auth_url, data=json.dumps(data))
            res = LoginRes.model_validate(response.json())
            return res

    def get_estoque(self, auth_token):
        headers = get_headers(auth_token)
        response = requests.get(f"self.firebase_db_url/orderBy=\"cluster_id\"", headers=headers)
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Missing or invalid token")
        documents = response.json()["documents"]
        estoque = []
        for document in documents:
            estoque.append(load_json_produto_into_obj(document))
        return estoque

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
        url = f"{self.firebase_db_url}{id}"
        response = requests.get(url, headers=headers)
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Missing or invalid token")
        return load_json_produto_into_obj(response.json())


    def add_estoque(self, produto, auth_token):
        headers = get_headers(auth_token)
        labels = {"arrayValue": {"values": [{"stringValue": label} for label in produto.labels]}}
        request_data = {
            "fields": {
                "nm_produto": {"stringValue": produto.nm_produto},
                "quantidade": {"integerValue": produto.quantidade},
                "labels": labels,
                "anotation": {"stringValue": produto.anotation},
                "cluster_id": {"integerValue": -1}
            }
        }
        response = requests.post(self.firebase_db_url, data=json.dumps(request_data), headers=headers)
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Missing or invalid token")
        return load_json_produto_into_obj(response.json())

    def update_estoque(self, id, produto, auth_token):
        headers = get_headers(auth_token)
        labels = {"arrayValue": {"values": [{"stringValue": label} for label in produto.labels]}}
        request_data = {
            "fields": {
                "nm_produto": {"stringValue": produto.nm_produto},
                "quantidade": {"integerValue": produto.quantidade},
                "labels": labels,
                "anotation": {"stringValue": produto.anotation},
            }
        }
        url = f"{self.firebase_db_url}{id}"
        response = requests.patch(url, data=json.dumps(request_data), headers=headers)
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Missing or invalid token")
        return load_json_produto_into_obj(response.json())

    def update_cluster(self, id, cluster_id, auth_token):
        headers = get_headers(auth_token)
        request_data = {
            "fields": {
                "cluster_id": {"integerValue": cluster_id}
            }
        }
        url = f"{self.firebase_db_url}{id}"
        response = requests.patch(url, data=json.dumps(request_data), headers=headers)
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Missing or invalid token")

    def get_estoque_size(self, auth_token) -> int:
        headers = get_headers(auth_token)
        response = requests.get(self.firebase_db_url, headers=headers)
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Missing or invalid token")
        documents = response.json()["documents"]
        return len(documents)


def get_db_manager() -> GenericDBManager:
    from dotenv import load_dotenv
    load_dotenv()
    if env == 'dev' or env == 'test':
        return DevDBManager()
    else:
        return FirestoreDBManager()
