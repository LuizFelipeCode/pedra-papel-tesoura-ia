import mediapipe as mp
import cv2
import numpy as np
import base64

# Inicialize o módulo de mãos do MediaPipe
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

def recognize_gesture(hand_landmarks):
    # Pontos de referência principais para cada dedo
    thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
    thumb_mcp = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_MCP]
    index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
    index_dip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_DIP]
    index_mcp = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_MCP]
    middle_tip = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
    middle_dip = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_DIP]
    middle_mcp = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_MCP]
    ring_tip = hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_TIP]
    ring_dip = hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_DIP]
    pinky_tip = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP]
    pinky_dip = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_DIP]

    # Função auxiliar para determinar se um dedo está levantado
    def is_finger_up(tip, mcp):
        return tip.y < mcp.y

    # Condições para reconhecer gestos
    if (thumb_tip.y < thumb_mcp.y and
        thumb_tip.y < index_mcp.y and
        thumb_tip.x < index_tip.x and
        np.hypot(thumb_tip.x - index_tip.x, thumb_tip.y - index_tip.y) > 0.2 and 
        not is_finger_up(index_tip, index_mcp) and
        not is_finger_up(middle_tip, middle_mcp)):
        return "Gesto não identificado"
    
    elif thumb_tip.y > thumb_mcp.y and not is_finger_up(index_tip, index_dip) and not is_finger_up(middle_tip, middle_dip):
        return "Gesto não identificado"
    
    elif is_finger_up(index_tip, index_dip) and is_finger_up(middle_tip, middle_dip) and \
         not is_finger_up(ring_tip, ring_dip) and not is_finger_up(pinky_tip, pinky_dip):
        return "✌️ (Sinal de Paz)"
    
    elif is_finger_up(index_tip, index_dip) and not is_finger_up(middle_tip, middle_dip) and \
         not is_finger_up(ring_tip, ring_dip) and not is_finger_up(pinky_tip, pinky_dip):
        return "Gesto não identificado"
    
    elif all(not is_finger_up(tip, dip) for tip, dip in [(index_tip, index_dip), (middle_tip, middle_dip), 
                                                         (ring_tip, ring_dip), (pinky_tip, pinky_dip)]):
        return "✊ (Punho fechado)"
    
    elif all(is_finger_up(tip, dip) for tip, dip in [(index_tip, index_dip), (middle_tip, middle_dip), 
                                                     (ring_tip, ring_dip), (pinky_tip, pinky_dip)]) and \
         thumb_tip.y < thumb_mcp.y:
        return "👋 (Mão aberta)"
    
    else:
        return "Gesto não identificado"

def capture_and_recognize():
    cap = cv2.VideoCapture(0)
    with mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as hands:

        ret, frame = cap.read()
        if not ret:
            print("Falha ao capturar a imagem")
            cap.release()
            return None, "Falha ao capturar a imagem"

        # Espelha a imagem horizontalmente
        frame = cv2.flip(frame, 1)

        # Converte a imagem para RGB
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image_rgb.flags.writeable = False  # Para melhorar o desempenho

        # Processa a imagem
        results = hands.process(image_rgb)

        gesture = "Nenhuma mão detectada."
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                gesture = recognize_gesture(hand_landmarks)

                # Desenha as anotações da mão na imagem
                mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing_styles.get_default_hand_landmarks_style(),
                    mp_drawing_styles.get_default_hand_connections_style())
        else:
            gesture = "Nenhuma mão detectada."

        # Codifica a imagem em base64
        _, buffer = cv2.imencode('.jpg', frame)
        image_base64 = base64.b64encode(buffer).decode('utf-8')

        cap.release()
        return image_base64, gesture

if __name__ == "__main__":
    image_base64, gesture = capture_and_recognize()
    print("Gesto reconhecido:", gesture)
    # Aqui você pode usar image_base64 conforme necessário

def process_image(image_base64):
    try:
        # Decodifica a imagem Base64
        image_data = base64.b64decode(image_base64)
        np_array = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

        # Converte a imagem para RGB
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Processa a imagem com MediaPipe
        with mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            model_complexity=1,
            min_detection_confidence=0.5) as hands:

            results = hands.process(image_rgb)
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    gesture = recognize_gesture(hand_landmarks)
                    return gesture
            else:
                return "Nenhuma mão detectada."
    except Exception as e:
        # Salva uma mensagem de erro no log caso algo dê errado
        print(f"Erro ao processar a imagem: {e}")
        return "Erro ao processar a imagem."
