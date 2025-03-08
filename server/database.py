from dotenv import load_dotenv
import os
import sqlite3
import requests
import json
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
        cursor.execute("CREATE TABLE IF NOT EXISTS estoque (id INTEGER PRIMARY KEY, nm_produto TEXT, quantidade INTEGER, status TEXT)")
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
            return
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
            return rows
        else:
            headers = get_headers(auth_token)
            response = requests.get(self.firebase_db_url, headers=headers)
            if response.status_code != 200:
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
            cursor.execute("SELECT * FROM estoque WHERE id = ?", (id,))
            row = cursor.fetchone()
            return row
        else:
            print(id)
            headers = get_headers(auth_token)
            url = f"{self.firebase_db_url}{id}"
            print(url)
            response = requests.get(url, headers=headers)
            print(response.json())
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Missing or invalid token")
            return load_json_produto_into_obj(response.json())

    def add_estoque(self, produto, auth_token):
        if self.is_dev_env:
            conn = self._get_db_conn()
            cursor = conn.cursor() 
            cursor.execute(
                "INSERT INTO estoque (nm_produto, quantidade, status) VALUES (?, ?)", 
                (produto.nm_produto, produto.quantidade, produto.status))
            conn.commit()
            return cursor.lastrowid
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
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Missing or invalid token")

            print(response.json())
            return load_json_produto_into_obj(response.json())

    def update_estoque(self, id, produto, auth_token):
        if self.is_dev_env:
            conn = self._get_db_conn()
            cursor = conn.cursor() 
            cursor.execute(
                "UPDATE estoque SET nm_produto = ?, quantidade = ?, status = ?, WHERE id = ?", 
                (produto.nm_produto, produto.quantidade, produto.status, id))
            conn.commit()
            return cursor.rowcount
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
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Missing or invalid token")
            return load_json_produto_into_obj(response.json())
