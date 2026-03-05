import face_recognition

def get_face_encoding(image):

    encodings = face_recognition.face_encodings(image)

    if len(encodings) == 0:
        return None

    return encodings[0].tolist()