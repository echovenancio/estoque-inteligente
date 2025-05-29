from fastapi import HTTPException

class NotFound(HTTPException):
    def __init__(self, obj):
        self.status_code = 404
        self.detail = f"{obj} Não foi encontrado."

class InternalServer(HTTPException):
    def __init__(self):
        self.status_code = 500
        self.detail = "Erro no servidor."

class Unauthorized(HTTPException):
    def __init__(self, type = "token"):
        self.status_code = 401
        if type == "token":
            self.detail = "Token inválido"
        else:
            self.detail = "Email ou senha inválido"