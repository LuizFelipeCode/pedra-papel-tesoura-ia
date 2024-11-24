# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import router

app = FastAPI()

# Configuração do CORS para permitir conexões do frontend
origins = [
    "http://localhost",
    "http://localhost:3000",
    # Adicione outros origens se necessário
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Você pode usar ["*"] para permitir todos os origens
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui o roteador de previsões
app.include_router(router.router)
