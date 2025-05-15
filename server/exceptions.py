from abc import ABC, abstractmethod
from fastapi import HTTPException

class NotFound(HTTPException):
    def __init__(self, class_obj):
        self.status_code = 404
        self.detail = f"{type(class_obj).__name__} Não foi encontrado."

class InternalServer(HTTPException):
    def __init__(self):
        self.status_code = 500
        self.detail = "Erro no servidor."

class Unauthorized(HTTPException):
    def __init__(self):
        self.status_code = 401
        self.detail = "Token inválido"