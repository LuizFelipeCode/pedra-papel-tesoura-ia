from pydantic import BaseModel
from app.utils.enums import Move, Winner
from typing import Optional

class PredictRequest(BaseModel):
    image: str  # Imagem codificada em base64

class resposta(BaseModel):
    player_move: Optional[Move]
    computer_move: Optional[Move]
    winner: Optional[Winner]
