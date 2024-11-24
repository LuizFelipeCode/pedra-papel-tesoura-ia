# app/routers/predict.py
from fastapi import APIRouter, HTTPException, Query
from app.utils.models import PredictRequest, resposta
from app.utils.enums import Move, Winner
from app.mediapipe.gestos import reconhecimento_gestos
from typing import Optional
import random

router = APIRouter()

@router.post("/predicao", response_model=resposta)
def predicao(request: PredictRequest, cheat_mode: Optional[bool] = Query(False)):
    # Decodifica a imagem e reconhece o gesto
    try:
        player_move = reconhecimento_gestos(request.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

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

    # Retorna a previsão
    return resposta(
        player_move=player_move,
        computer_move=computer_move,
        winner=winner
    )
