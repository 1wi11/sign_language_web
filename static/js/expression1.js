const ExSocket = new WebSocket(
    'ws://'
    + windows.location.host
    + '/ws/exp'
    + '/'
);

function webcam(){
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
}

const emotions = ['화남', '슬픔', '기쁨', '중립', '놀람'];
function randomEmotion() {
    const randomIndex = Math.floor(Math.random() * emotions.length);
    const randomWord = emotions[randomIndex];
  
    const emotionElement = document.getElementById('emotionWord');
    emotionElement.textContent = randomWord;
    ExSocket.send(randomWord)
}

const video = document.getElementById('video');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

function captureImage(){
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0,800,600);
    canvas.toBlob(blob => {ExSocket.send(blob);},'image/jpeg',0.5);
}
