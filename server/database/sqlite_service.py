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
        id=row[0],
        nm_produto=row[1],
        type_quantidade=row[2],
        val_quantidade=row[3],
        min_quantity=row[4],
        labels=json.loads(row[5]),
        anotation=row[6],
        cluster_id=row[7],
        created_at=str(row[8]),
        updated_at=str(row[9]),
        image_url=row[10] if len(row) > 10 and row[10] else "",
        loja_id=row[11] if len(row) > 11 and row[11] else "",
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
        
        # Create Lojas table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS lojas (
                id TEXT PRIMARY KEY,
                nome TEXT NOT NULL,
                foto_url TEXT,
                localizacao TEXT,
                dono_email TEXT NOT NULL
            )
            """
        )

        # Create Permissoes table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS permissoes (
                loja_id TEXT NOT NULL,
                email TEXT NOT NULL,
                papel TEXT NOT NULL,
                PRIMARY KEY (loja_id, email),
                FOREIGN KEY (loja_id) REFERENCES lojas (id)
            )
            """
        )

        cursor.execute(
            "CREATE TABLE IF NOT EXISTS estoque (uuid TEXT, nm_produto TEXT, type_quantidade TEXT, val_quantidade REAL, min_quantity REAL, labels TEXT, anotation TEXT, cluster_id INTEGER, created_at TEXT, updated_at TEXT, image_url TEXT, loja_id TEXT)"
        )
        
        # Migrations
        try:
            cursor.execute("ALTER TABLE estoque ADD COLUMN image_url TEXT")
        except sqlite3.OperationalError:
            pass 
            
        try:
            cursor.execute("ALTER TABLE estoque ADD COLUMN loja_id TEXT")
        except sqlite3.OperationalError:
            pass

        cursor.execute(
            "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, hash_password TEXT)"
        )
        cursor.execute(
            "INSERT OR IGNORE INTO users (id, email, hash_password) VALUES (1, 'loja@email.com', '123456')"
        )
        cursor.execute(
            "INSERT OR IGNORE INTO users (id, email, hash_password) VALUES (2, 'fabrica@email.com', '123456')"
        )
        self.setted = True
        conn.commit()
        cursor.close()
        self.conn = conn

    def create_loja(self, loja: "Loja") -> "Loja":
        conn = self._get_db_conn()
        cursor = conn.cursor()
        loja_id = str(uuid4())
        cursor.execute(
            "INSERT INTO lojas (id, nome, foto_url, localizacao, dono_email) VALUES (?, ?, ?, ?, ?)",
            (loja_id, loja.nome, loja.foto_url, loja.localizacao, loja.dono_email),
        )
        # Owner gets admin permission automatically
        cursor.execute(
            "INSERT INTO permissoes (loja_id, email, papel) VALUES (?, ?, ?)",
            (loja_id, loja.dono_email, "admin"),
        )
        conn.commit()
        cursor.close()
        loja.id = loja_id
        return loja

    def get_lojas_by_user(self, email: str) -> list["Loja"]:
        conn = self._get_db_conn()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT l.id, l.nome, l.foto_url, l.localizacao, l.dono_email, p.papel
            FROM lojas l
            JOIN permissoes p ON l.id = p.loja_id
            WHERE p.email = ?
            """,
            (email,),
        )
        rows = cursor.fetchall()
        cursor.close()
        
        from domain.models import Loja
        return [
            Loja(id=row[0], nome=row[1], foto_url=row[2], localizacao=row[3], dono_email=row[4], papel=row[5])
            for row in rows
        ]

    def add_permission(self, loja_id: str, email: str, papel: str):
        conn = self._get_db_conn()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT OR REPLACE INTO permissoes (loja_id, email, papel) VALUES (?, ?, ?)",
                (loja_id, email, papel),
            )
            conn.commit()
        except Exception as e:
            logging.error(f"Error adding permission: {e}")
            raise e
        finally:
            cursor.close()

    def get_permissions(self, loja_id: str):
        conn = self._get_db_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT email, papel FROM permissoes WHERE loja_id = ?",
            (loja_id,),
        )
        rows = cursor.fetchall()
        cursor.close()
        return [{"email": row[0], "papel": row[1]} for row in rows]

    def _get_db_conn(self):
        self.__create_dev_tables()
        if self.url == None:
            logging.error("Database URL not set")
            sys.exit(1)
        return self.conn

    def login(self, email, password):
        cursor = self._get_db_conn().cursor()
        cursor.execute(
            "SELECT * FROM users WHERE email = ? AND hash_password = ?",
            (email, password),
        )
        row = cursor.fetchone()
        cursor.close()
        if row:
            return LoginRes(
                kind="identitytoolkit#VerifyPasswordResponse",
                localId="fakeid",
                email=row[1],
                displayName=row[1],
                idToken=f"faketoken:{row[1]}",
                registered=True,
                refreshToken="fakerefreshtoken",
                expiresIn="3600",
            )
        else:
            raise Unauthorized(type="login")

    def get_estoque(self, auth_token, loja_id: str = None) -> list[ResProduto]:
        cursor = self._get_db_conn().cursor()
        try:
            if loja_id:
                # Verify if user has access to this store
                user_email = auth_token["email"]
                cursor.execute(
                    "SELECT 1 FROM permissoes WHERE loja_id = ? AND email = ?",
                    (loja_id, user_email)
                )
                if not cursor.fetchone():
                    cursor.close()
                    raise Unauthorized("User does not have access to this store")

                cursor.execute("SELECT * FROM estoque WHERE loja_id = ? ORDER BY cluster_id ASC", (loja_id,))
            else:
                # Fallback: return empty if no store selected
                cursor.close()
                return []
                
            rows = cursor.fetchall()
            cursor.close()
        except Exception as e:
            if isinstance(e, Unauthorized):
                raise e
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
        if not produto.loja_id:
            raise ValueError("loja_id is required")

        uuid = str(uuid4())
        conn = self._get_db_conn()
        try:
            cursor = conn.cursor()
            
            # Verify permission
            user_email = auth_token["email"]
            cursor.execute(
                "SELECT papel FROM permissoes WHERE loja_id = ? AND email = ?",
                (produto.loja_id, user_email)
            )
            perm = cursor.fetchone()
            if not perm: 
                cursor.close()
                raise Unauthorized("User does not have permission to add products to this store")

            cursor.execute(
                "INSERT INTO estoque (uuid, nm_produto, type_quantidade, val_quantidade, min_quantity, labels, anotation, cluster_id, created_at, updated_at, image_url, loja_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)",
                (
                    uuid,
                    produto.nm_produto,
                    produto.type_quantidade.lower(),
                    produto.val_quantidade,
                    produto.min_quantity,
                    json.dumps(produto.labels),
                    produto.anotation,
                    0,
                    produto.image_url,
                    produto.loja_id
                ),
            )
            conn.commit()
            cursor.close()
        except Exception as e:
            raise InternalServer()
        return self.get_produto(uuid, auth_token)

    def update_estoque(self, id, produto, auth_token):
        conn = self._get_db_conn()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE estoque SET nm_produto = ?, type_quantidade = ?, val_quantidade = ?, min_quantity = ?, labels = ?, anotation = ?, updated_at = datetime('now'), image_url = ? WHERE uuid = ?",
                (
                    produto.nm_produto,
                    produto.type_quantidade.lower(),
                    produto.val_quantidade,
                    produto.min_quantity,
                    json.dumps(produto.labels),
                    produto.anotation,
                    produto.image_url,
                    id,
                ),
            )
            conn.commit()
            cursor.close()
        except Exception:
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
                (cluster_id, id),
            )
            conn.commit()
            cursor.close()
        except Exception:
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

    def delete_produto(self, id, auth_token) -> bool:
        print(f"Deleting product with id: {id}")
        conn = self._get_db_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM estoque WHERE uuid = ?", (id,))
            conn.commit()
            cursor.close()
            print(f"Product with id: {id} deleted successfully")
        except Exception:
            raise NotFound("Produto")
        return True

    def get_low_stock_produtos(self, auth_token) -> list[ResProduto]:
        user_email = auth_token["email"]
        cursor = self._get_db_conn().cursor()
        try:
            cursor.execute(
                """
                SELECT e.* 
                FROM estoque e
                JOIN permissoes p ON e.loja_id = p.loja_id
                WHERE p.email = ? 
                AND e.val_quantidade < e.min_quantity 
                AND e.min_quantity > 0 
                ORDER BY e.cluster_id ASC
                """,
                (user_email,)
            )
            rows = cursor.fetchall()
            cursor.close()
        except Exception:
            raise InternalServer()
        produtos = []
        for row in rows:
            produtos.append(map_product_to_response(row))
        return produtos

    def create_user(self, email, password):
        conn = self._get_db_conn()
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO users (email, hash_password) VALUES (?, ?)", (email, password))
            conn.commit()
        except sqlite3.IntegrityError:
            cursor.close()
            raise ValueError("User already exists")
        cursor.close()
        return self.login(email, password)

    def update_loja(self, loja_id: str, loja: "Loja", auth_token: dict) -> "Loja":
        conn = self._get_db_conn()
        cursor = conn.cursor()
        
        # Verify if user is admin of the store
        user_email = auth_token["email"]
        cursor.execute(
            "SELECT papel FROM permissoes WHERE loja_id = ? AND email = ?",
            (loja_id, user_email)
        )
        perm = cursor.fetchone()
        if not perm or perm[0] != 'admin':
            cursor.close()
            raise Unauthorized("Only admins can update store settings")

        cursor.execute(
            "UPDATE lojas SET nome = ?, foto_url = ?, localizacao = ? WHERE id = ?",
            (loja.nome, loja.foto_url, loja.localizacao, loja_id)
        )
        conn.commit()
        cursor.close()
        loja.id = loja_id
        loja.dono_email = user_email # Keep owner
        return loja
