const ExSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/expression'
    + '/'
);

const constraints = {audio: false, video: true};

function webcam(){
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(mediaStream){
      video.srcObject = mediaStream;
  })
}

ExSocket.onmessage = function(event) {
    const receivedData = JSON.parse(event.data);

    const emotionPercentage = receivedData.emotion_percentage.toFixed(2);
    const outputWebmData = receivedData.output_webm;

    const binaryData = atob(outputWebmData);
    const uint8Array = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: 'video/webm' });
    const videoURL = URL.createObjectURL(blob);

    const myboxdata = document.querySelector('.my-box');
    myboxdata.innerHTML = emotionPercentage;

    const videoElement = document.getElementById('video2');
    videoElement.src = videoURL;
};
  
let mediaRecorder = null;

function Startbtn(){
    let mediaData = [];

    const emotions = ['기쁨', '화남', '중립', '슬픔', '놀람'];
    const randomIndex = Math.floor(Math.random() * emotions.length);
    const randomWord = emotions[randomIndex];
  
    const emotionElement = document.getElementById('emotionWord');
    emotionElement.textContent = randomWord;

    mediaRecorder = new MediaRecorder(video.srcObject, {
        mimeType: "video/webm; codecs=vp9"
    });

    mediaRecorder.ondataavailable = function(event){
        if(event.data && event.data.size > 0){
          mediaData.push(event.data);
        }
    }

    mediaRecorder.onstop = function(){
        const blob = new Blob(mediaData, {type: "video/webm"});
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64Data = event.target.result.split(',')[1]; // Base64 데이터 추출
    
            const data = {
                "bytes_data": base64Data,
                "text_data": randomIndex
            };
    
            const json_data = JSON.stringify(data);
            ExSocket.send(json_data);
        };
        reader.readAsDataURL(blob); // Blob 데이터를 Base64로 인코딩하여 읽어옴
    }

    mediaRecorder.start();
    startTimer();
    setTimeout(Finishbtn,10000);
}

function Finishbtn(){
    if(mediaRecorder){
        mediaRecorder.stop();
        mediaRecorder = null;
    }
}

let seconds = 10;
const timerElement = document.getElementById('timer');
let timerInterval;

function startTimer() {
    timerInterval = setInterval(function() {
      seconds--;
      timerElement.textContent = seconds;
  
      if (seconds === 0) {
        clearInterval(timerInterval);
        timerElement.textContent = '0';
  
        setTimeout(function() {
          seconds = 10;
          timerElement.textContent = '10';
        }, 1000);
      }
    }, 1000);
}