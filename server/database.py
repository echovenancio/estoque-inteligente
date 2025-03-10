from dotenv import load_dotenv
import os
import sqlite3
import requests
import json
from uuid import uuid4
from fastapi import HTTPException

from models import LoginRes, ResProduto

load_dotenv()

def load_json_produto_into_obj(json_produto):
    id = json_produto["name"].split("/")[-1]
    produto = ResProduto(
        id=id, 
        nm_produto=json_produto["fields"]["nm_produto"]["stringValue"], 
        quantidade=json_produto["fields"]["quantidade"]["integerValue"],
        status=json_produto["fields"]["status"]["stringValue"],
        created_at=json_produto["createTime"],
        updated_at=json_produto["updateTime"])
    return produto

def get_headers(auth_token):
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }

class DBManager:
    def __init__(self):
        self.is_dev_env = os.getenv("ENV") == "dev"
        if not self.is_dev_env:
            self.firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
            self.firebase_api_key = os.getenv("FIREBASE_API_KEY")
            self.firebase_auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={self.firebase_api_key}"
            self.firebase_db_url = f"https://firestore.googleapis.com/v1/projects/{self.firebase_project_id}/databases/(default)/documents/estoque/"

    def __create_dev_tables(self):
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS estoque (uuid TEXT, nm_produto TEXT, quantidade INTEGER, status TEXT, created_at TEXT, updated_at TEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, hash_password TEXT)")
        cursor.execute("INSERT OR IGNORE INTO users (id, email, hash_password) VALUES (1, 'loja@email.com', '123456')")
        cursor.execute("INSERT OR IGNORE INTO users (id, email, hash_password) VALUES (2, 'fabrica@email.com', '123456')")
        conn.commit()
        conn.close()

    def _get_db_conn(self):
        if self.is_dev_env:
            self.__create_dev_tables()
            return sqlite3.connect("database.db")
        else:
            raise EnvironmentError("Production environment is not supported yet.")

    def login(self, email, password):
        if self.is_dev_env:
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
                return None
        else:
            data = {
                "email": email,
                "password": password,
                "returnSecureToken": True
            }
            response = requests.post(self.firebase_auth_url, data=json.dumps(data))
            print("aqui")
            res = LoginRes.model_validate(response.json())
            return res

    def get_estoque(self, auth_token):
        if self.is_dev_env:
            cursor = self._get_db_conn().cursor()
            cursor.execute("SELECT * FROM estoque")
            rows = cursor.fetchall()
            print(rows)
            produtos = []
            for row in rows:
                produtos.append(ResProduto(id=row[0], nm_produto=row[1], quantidade=row[2], status=row[3], created_at=row[4], updated_at=row[5]))
            return produtos
        else:
            headers = get_headers(auth_token)
            response = requests.get(self.firebase_db_url, headers=headers)
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Missing or invalid token")
            documents = response.json()["documents"]
            print(response.json())
            print(documents)
            estoque = []
            for document in documents:
                estoque.append(load_json_produto_into_obj(document))
            return estoque

    def get_produto(self, id, auth_token):
        if self.is_dev_env:
            cursor = self._get_db_conn().cursor()
            cursor.execute("SELECT * FROM estoque WHERE uuid = ?", (id,))
            row = cursor.fetchone()
            print("pegando produto", row)
            return ResProduto(id=row[0], nm_produto=row[1], quantidade=row[2], status=row[3], created_at=row[4], updated_at=row[5])
        else:
            print(id)
            headers = get_headers(auth_token)
            url = f"{self.firebase_db_url}{id}"
            print(url)
            response = requests.get(url, headers=headers)
            print(response.json())
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Missing or invalid token")
            return load_json_produto_into_obj(response.json())

    def add_estoque(self, produto, auth_token):
        if self.is_dev_env:
            uuid = str(uuid4())
            conn = self._get_db_conn()
            print(produto)
            cursor = conn.cursor() 
            cursor.execute(
                "INSERT INTO estoque (uuid, nm_produto, quantidade, status, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))", 
                (uuid, produto.nm_produto, produto.quantidade, produto.status))
            conn.commit()
            produto = self.get_produto(uuid, auth_token)
            return produto
        else:
            headers = get_headers(auth_token)
            request_data = {
                "fields": {
                    "nm_produto": {"stringValue": produto.nm_produto},
                    "quantidade": {"integerValue": produto.quantidade},
                    "status": {"stringValue": produto.status} 
                }
            }
            response = requests.post(self.firebase_db_url, data=json.dumps(request_data), headers=headers)
            print(response.json())
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Missing or invalid token")
            print(response.json())
            return load_json_produto_into_obj(response.json())

    def update_estoque(self, id, produto, auth_token):
        if self.is_dev_env:
            conn = self._get_db_conn()
            cursor = conn.cursor() 
            cursor.execute(
                "UPDATE estoque SET nm_produto = ?, quantidade = ?, status = ?, updated_at = datetime('now') WHERE uuid = ?", 
                (produto.nm_produto, produto.quantidade, produto.status, id))
            conn.commit()
            produto = self.get_produto(id, auth_token)
            return produto
        else:
            headers = get_headers(auth_token)
            request_data = {
                "fields": {
                    "nm_produto": {"stringValue": produto.nm_produto},
                    "quantidade": {"integerValue": produto.quantidade},
                    "status": {"stringValue": produto.status} 
                }
            }
            url = f"{self.firebase_db_url}{id}"
            response = requests.patch(url, data=json.dumps(request_data), headers=headers)
            print(response.json())
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Missing or invalid token")
            return load_json_produto_into_obj(response.json())
