# app/routers/predict.py
from fastapi import APIRouter, HTTPException, Query
from app.utils.models import resposta
from app.utils.enums import Move, Winner
from typing import Optional
import random

# Importe a função capture_and_recognize
from app.mediapipe.gestos import capture_and_recognize

router = APIRouter()

@router.post("/predicao", response_model=resposta)
def predicao(cheat_mode: Optional[bool] = Query(False)):
    # Captura a imagem e reconhece o gesto
    try:
        image_base64, gesture = capture_and_recognize()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Mapeia o gesto para um movimento do jogo
    if gesture == "✊ (Punho fechado)":
        player_move = Move.pedra
    elif gesture == "👋 (Mão aberta)":
        player_move = Move.papel
    elif gesture == "✌️ (Sinal de Paz)":
        player_move = Move.tesoura
    else:
        raise HTTPException(status_code=400, detail="Gesto não reconhecido ou não suportado.")

    # Determina o movimento do computador
    if cheat_mode:
        # Computador sempre ganha
        if player_move == Move.pedra:
            computer_move = Move.papel
        elif player_move == Move.papel:
            computer_move = Move.tesoura
        else:
            computer_move = Move.pedra
    else:
        # Computador joga aleatoriamente
        computer_move = random.choice([Move.pedra, Move.papel, Move.tesoura])

    # Determina o vencedor
    if player_move == computer_move:
        winner = Winner.draw
    elif (player_move == Move.pedra and computer_move == Move.tesoura) or \
         (player_move == Move.papel and computer_move == Move.pedra) or \
         (player_move == Move.tesoura and computer_move == Move.papel):
        winner = Winner.player
    else:
        winner = Winner.computer

    # Retorna a resposta
    return resposta(
        player_move=player_move,
        computer_move=computer_move,
        winner=winner,
        image=image_base64  # Inclui a imagem capturada na resposta
    )
