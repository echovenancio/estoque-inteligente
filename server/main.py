from fastapi import FastAPI
from v1 import endpoints as v1_endpoints

app = FastAPI()

app.include_router(v1_endpoints.router, prefix="/v1", tags=["v1"])
