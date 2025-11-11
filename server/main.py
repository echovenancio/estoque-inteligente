from fastapi import FastAPI
from v1 import endpoints as v1_endpoints
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specific origin list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(v1_endpoints.router, prefix="/v1", tags=["v1"])
