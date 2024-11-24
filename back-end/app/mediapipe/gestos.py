import base64
from app.utils.enums import Move
import random

def reconhecimento_gestos(image_base64: str) -> Move:
    # Decodifica a imagem
    try:
        image_data = base64.b64decode(image_base64)
        # Aqui você processaria a imagem usando MediaPipe ou outro modelo
        # Por enquanto, vamos simular o reconhecimento de gestos
        player_move = random.choice([Move.pedra, Move.papel, Move.tesoura])
        return player_move
    except Exception as e:
        raise Exception("Dados de imagem inválidos ou erro no reconhecimento de gestos")
