from dotenv import load_dotenv
import os
import sqlite3

load_dotenv()

class DBManager:
    def __init__(self):
        self.is_dev_env = os.getenv("ENV") == "dev"

    def __create_dev_tables(self):
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS estoque (id INTEGER PRIMARY KEY, nm_produto TEXT, qt INTEGER)")
        conn.commit()
        conn.close()

    def _get_db_conn(self):
        if self.is_dev_env:
            self.__create_dev_tables()
            return sqlite3.connect("database.db")
        else:
            raise EnvironmentError("Production environment is not supported yet.")

    def get_estoque(self):
        if self.is_dev_env:
            cursor = self._get_db_conn().cursor()
            cursor.execute("SELECT * FROM estoque")
            rows = cursor.fetchall()
            return rows
        else:
            raise EnvironmentError("Production environment is not supported yet.")

    def get_produto(self, id):
        if self.is_dev_env:
            cursor = self._get_db_conn().cursor()
            cursor.execute("SELECT * FROM estoque WHERE id = ?", (id,))
            row = cursor.fetchone()
            return row
        else:
            raise EnvironmentError("Production environment is not supported yet.")

    def add_estoque(self, nm_produto, qt):
        if self.is_dev_env:
            conn = self._get_db_conn()
            cursor = conn.cursor() 
            cursor.execute("INSERT INTO estoque (nm_produto, qt) VALUES (?, ?)", (nm_produto, qt))
            conn.commit()
            return cursor.lastrowid
        else:
            raise EnvironmentError("Production environment is not supported yet.")

    def update_estoque(self, id, qt):
        if self.is_dev_env:
            conn = self._get_db_conn()
            cursor = conn.cursor() 
            cursor.execute("UPDATE estoque SET qt = ? WHERE id = ?", (qt, id))
            conn.commit()
            return cursor.rowcount
        else:
            raise EnvironmentError("Production environment is not supported yet.")


