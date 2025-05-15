from config import settings
from domain.exceptions import NotFound, InternalServer, Unauthorized
import sqlite3
import logging
import sys
from domain.models import LoginRes, ResProduto, Produto
from database.generic_repository import GenericDBManager
from uuid import uuid4
import json

def map_product_to_response(row) -> ResProduto:
    """
    Maps a database row to a ResProduto object.
    
    Args:
        row: A tuple representing a row from the database.
        
    Returns:
        An instance of ResProduto with the mapped values.
    """
    return ResProduto(
        id = row[0],
        nm_produto = row[1],
        type_quantidade = row[2],
        val_quantidade = row[3],
        labels = json.loads(row[4]),
        anotation = row[5],
        cluster_id = row[6],
        created_at = str(row[7]),
        updated_at = str(row[8])
    )


class DevDBManager(GenericDBManager):

    def __init__(self):
        self.setted = False
        pass

    def __create_dev_tables(self):
            conn = None
            if settings.save_to_file == "yes":
                self.url = "database.db"
                conn = sqlite3.connect(self.url)
            else:
                self.url = "file::memory:?cache=shared"
                conn = sqlite3.connect(self.url, uri=True)
            cursor = conn.cursor()
            if self.setted is not True:
                cursor.execute("CREATE TABLE IF NOT EXISTS estoque (uuid TEXT, nm_produto TEXT, type_quantidade TEXT, val_quantidade REAL, labels TEXT, anotation TEXT, cluster_id INTEGER, created_at TEXT, updated_at TEXT)")
                cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, hash_password TEXT)")
                cursor.execute("INSERT OR IGNORE INTO users (id, email, hash_password) VALUES (1, 'loja@email.com', '123456')")
                cursor.execute("INSERT OR IGNORE INTO users (id, email, hash_password) VALUES (2, 'fabrica@email.com', '123456')")
                self.setted = True
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
        cursor.close()
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
            raise Unauthorized(type="login")

    def get_estoque(self, auth_token) -> list[ResProduto]:
        cursor = self._get_db_conn().cursor()
        try:
            cursor.execute("SELECT * FROM estoque ORDER BY cluster_id ASC")
            rows = cursor.fetchall()
            cursor.close()
        except Exception as e:
            raise InternalServer()
        produtos = []
        for row in rows:
            produtos.append(map_product_to_response(row))
        return produtos

    def get_produto(self, id, auth_token):
        cursor = self._get_db_conn().cursor()
        cursor.execute("SELECT * FROM estoque WHERE uuid = ?", (id,))
        row = cursor.fetchone()
        if not row:
            raise NotFound("Produto")
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
            cursor.close()
        except Exception as e:
            print(e)
            raise InternalServer()
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
            cursor.close()
        except Exception as e:
            raise NotFound("Produto")
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
            cursor.close()
        except Exception as e:
            raise NotFound("Produto")

    def get_estoque_size(self, auth_token) -> int:
        cursor = self._get_db_conn().cursor()
        cursor.execute("SELECT COUNT(*) FROM estoque")
        row = cursor.fetchone()
        cursor.close()
        if row:
            return row[0]
        else:
            raise InternalServer()