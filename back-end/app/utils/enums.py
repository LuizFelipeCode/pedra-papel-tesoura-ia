from enum import Enum

class Move(str, Enum):
    pedra = 'pedra'
    papel = 'papel'
    tesoura = 'tesoura'

class Winner(str, Enum):
    player = 'player'
    computer = 'computer'
    draw = 'draw'
