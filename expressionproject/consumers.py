import json
import base64
from django.core.files.base import ContentFile
from channels.generic.websocket import WebsocketConsumer
from . import models
import json
import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import os,sys


#command2 = f"ffmpeg -y -i openpose.avi output.webm"
#command3 = f"./build/examples/openpose/openpose.bin --face --hand --video {output_path} --write_json ./output_json/ --display 0 --write_video ../openpose.avi
#command4 = f"ffmpeg -y -fflags +genpts -i openpose.avi -r 24 openpose.webm" 

categories = ['happy', 'angry', 'neutral', 'sad', 'surprise']
model_path = './model/keypoint_classifier/keypoint_classifier.hdf5'
model = tf.keras.models.load_model(model_path)

mp_drawing = mp.solutions.drawing_utils
mp_face_mesh = mp.solutions.face_mesh
mp_face_detection = mp.solutions.face_detection



def calculate_emotion_percentage(emotion_landmarks, face_landmarks):
    emotion_area = 0
    for x, y in emotion_landmarks:
        if 0 <= x < 1 and 0 <= y < 1:
            emotion_area += 1

    face_area = len(face_landmarks)

    if face_area == 0:
        return 0.0

    return (emotion_area / face_area) * 100

def extract_landmarks(image):
    with mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            min_detection_confidence=0.5) as face_mesh:

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(image_rgb)

        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            return [(landmark.x, landmark.y) for landmark in landmarks]

        return None

class CameraImageConsumer(WebsocketConsumer):

    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        try:
            data = json.loads(text_data)
    
            bytes_data = base64.b64decode(data["bytes_data"])
            expression_label = categories[2]
            word_data = data["text_data"]

            file_path = os.path.join("image", 'temp_video.webm')
            with open(file_path, 'wb') as f:
                f.write(bytes_data)
            
            output_path = os.path.join("image", 'temp_video.mp4')
            command = f"ffmpeg -y -fflags +genpts -i {file_path} -r 24 {output_path}" 
            os.system(command)

            if os.path.exists(output_path):
                print("temp_video.mp4 파일이 생성되었습니다.")

                cap = cv2.VideoCapture(output_path)

                total_frames = 0
                emotion_frames = 0

                while True:
                    ret, frame = cap.read()

                    if not ret:
                        break
                    
                    frame = cv2.flip(frame, 1)
                    landmarks = extract_landmarks(frame)

                    if landmarks:
                        landmarks = np.array(landmarks)
                        landmarks = (landmarks - landmarks.min(axis=0)) / (landmarks.max(axis=0) - landmarks.min(axis=0))

                        input_data = np.expand_dims(landmarks.flatten(), axis=0)

                        predictions = model.predict(input_data)
                        predicted_class_index = np.argmax(predictions)
                        predicted_emotion = categories[predicted_class_index]

                        if predicted_emotion == expression_label:
                            emotion_frames += 1

                        total_frames += 1
                
                emotion_percentage = (emotion_frames / total_frames) * 100
                print(f"Percentage of {expression_label} emotion in the video: {emotion_percentage:.2f}%")

                file_path1 = os.path.join("image", "output.mp4")
                output_path1 = os.path.join("image", 'output.webm')
                command = f"ffmpeg -y -fflags +genpts -i {file_path1} -r 24 {output_path1}" 
                os.system(command)

                if os.path.exists(output_path1):
                    with open(output_path1, 'rb') as file:
                        bytes_data = file.read()

                    base64_data = base64.b64encode(bytes_data).decode('utf-8')
                    data_to_send = {
                        'emotion_percentage': emotion_percentage,
                        'output_webm': base64_data
                    }

                    self.send(text_data=json.dumps(data_to_send))

        except Exception as e:
            print(f"예외 발생: {e}")