var learningRadio = document.getElementById("radio-1");
var practiceRadio = document.getElementById("radio-2");
var squareBox1 = document.querySelector(".square-box1");
var title1 = document.querySelector(".title1");
var videoContainer = document.querySelector(".video");
let recordedVideoElement = document.getElementById('recorded-video');
var wordNumberSelect = document.getElementById("word-number");
var sentenceNumberSelect = document.getElementById("sentence-number");
var startButton = document.querySelector('.start button');
var resultButton = document.getElementById("resultButton");
var returnButton = document.getElementById("returnButton");
var answerButton = document.getElementById("answerButton");
var myvideoButton = document.getElementById("myvideoButton");
var optionsElement = document.querySelector(".options");
var inputTypeElement = document.querySelector(".input-type");
var dayElement = document.querySelector(".day");
var wordNumberDiv = document.querySelector(".word-number");
var sentenceNumberDiv = document.querySelector(".sentence-number");
var timerDiv = document.getElementById('timer');
const recordedVideo = document.getElementById('recorded-video');
var scoreElement = document.querySelector('.score');

// 소켓관련 
const ExSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/learning'
    + '/'
);

var scoreSpan = document.getElementById('score');

ExSocket.onmessage = function(event) {
    resultButton.style.display = "block";  // 결과 버튼 보이기

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

    recordedVideoElement.src = videoURL
    scoreSpan.innerText = emotionPercentage
};

// 옵션 선택 시 이벤트 리스너 등록
wordNumberSelect.addEventListener("change", function() {
    var selectedOption = wordNumberSelect.value; 
    const videoPath = videoSrc + selectedOption + ".mp4"

    videoContainer.innerHTML = '';
    if (videoPath !== "") {
        var videoElement = document.createElement("video");
        videoElement.src = videoPath;
        videoElement.controls = true;
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoContainer.appendChild(videoElement);
    }
});

// 페이지 로드 시 초기 영상 설정
document.addEventListener("DOMContentLoaded", function() {
    var initialOption = wordNumberSelect.value;
    wordNumberSelect.dispatchEvent(new Event("change"));
});

learningRadio.addEventListener("change", function() {
    squareBox1.classList.add("learning-mode");
    title1.innerHTML = "<h7>학습</h7>";
});

var wordRadio = document.getElementById("learning");
var sentenceRadio = document.getElementById("practice");
var videoNumberElement = document.querySelector('.video-number');
var startElement = document.querySelector('.start')

wordRadio.addEventListener("change", function() {
    wordNumberDiv.style.display = "block";
    sentenceNumberDiv.style.display = "none";
});
sentenceRadio.addEventListener("change", function() {
    wordNumberDiv.style.display = "none";
    sentenceNumberDiv.style.display = "block";
});

videoNumberElement.style.display = 'none';
startElement.style.display = 'none';

let seconds = 10;
const timerElement = document.getElementById('timer');
let timerInterval;
let mediaStream = null;
let mediaRecorder = null;
let recordedWebcamURL = null;

// 타이머 시작
function startTimer() {
    timerInterval = setInterval(function() {
      seconds--;
      timerElement.textContent = seconds;
  
      if (seconds === 0) {
        clearInterval(timerInterval);
        
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }

        setTimeout(function() {
          seconds = 10;
          timerElement.textContent = '10';
        }, 1000);
      }
    }, 1000);
}

let webcamStream = null;  // 전역 스트림 변수

function startWebcam() {
    if (webcamStream) {
        // 이미 웹캠 스트림이 있는 경우, 추가 접근 권한 요청을 하지 않음
        let video = document.getElementById('webcam');
        video.srcObject = webcamStream;
        video.style.display = "block";
        video.play();
        return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                webcamStream = stream;  // 스트림 저장
                let video = document.getElementById('webcam');
                video.srcObject = stream;
                video.style.display = "block";
                video.play();
            })
            .catch(function(err) {
                console.error("웹캠 접근에 실패했습니다: ", err);
            });
    } else {
        alert("현재 사용 중인 브라우저에서는 웹캠 접근을 지원하지 않습니다.");
    }
}

var randomIndex;

startButton.addEventListener('click', function() {
    startTimer();
    recordWebcamForDuration(10 * 1000);  

    // 랜덤으로 번호 선택
    randomIndex = Math.floor(Math.random() * 20) + 1; 

    var videoNumberText = "영상 번호: " + randomIndex;
    var videoNumberElement = document.querySelector(".video-number");
    videoNumberElement.textContent = videoNumberText;
    // 선택한 랜덤 숫자에 해당하는 비디오 경로 설정
    var videoPath = videoSrc + randomIndex + ".mp4";

    // 비디오 컨테이너 초기화
    videoContainer.innerHTML = '';

    // 선택한 비디오 경로가 유효한 경우 비디오 재생
    if (videoPath !== "") {
        var videoElement = document.createElement("video");
        videoElement.src = videoPath;
        videoElement.controls = true;
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoContainer.appendChild(videoElement);
    }
});

// 웹캠 녹화 시작
function recordWebcamForDuration(duration) {
    if (webcamStream) { // 이미 웹캠 스트림이 있는 경우
        let mediaData = []; 

        mediaRecorder = new MediaRecorder(webcamStream);

        mediaRecorder.ondataavailable = function(event){
            if(event.data && event.data.size > 0){
              mediaData.push(event.data);
            }
        }

        mediaRecorder.onstop = () => {
            const blob = new Blob(mediaData, {type: "video/webm" });
            const reader = new FileReader();
            

            reader.onload = function(event) {
                const base64Data = event.target.result.split(',')[1];
        
                const data = {
                    "bytes_data" : base64Data,
                    "text_data" : randomIndex
                };
        
                const json_data = JSON.stringify(data);
                ExSocket.send(json_data);
                console.log(json_data);
            };
            reader.readAsDataURL(blob);
        };

        mediaRecorder.start();

        setTimeout(() => {
            mediaRecorder.stop();
        }, duration);
    } else {
        alert("웹캠 접근 권한이 없습니다. 먼저 웹캠 접근을 허용해주세요.");
    }
}

myvideoButton.addEventListener('click', function() {
    let recordedVideoElement = document.getElementById('recorded-video');
    
    if (recordedVideoElement.src) {
        if (recordedVideoElement.paused) {  // 영상이 일시정지 상태인 경우
            recordedVideoElement.play();    // 영상 재생
        } else {
            recordedVideoElement.pause();   // 영상 일시정지
        }
    } else {
        alert('녹화된 영상이 없습니다.');
    }
});

// "돌아가기" 버튼을 누르면 학습 또는 연습 모드로 돌아가는 기능
returnButton.addEventListener("click", function() {
    if (learningRadio.checked) {
        setLearningMode();
    } else if (practiceRadio.checked) {
        setPracticeMode();
    }
    optionsElement.style.display = "block";
    inputTypeElement.style.display = "block";
    dayElement.style.display = "block";
});

// 정답 버튼의 클릭 이벤트에 리스너를 추가합니다.
answerButton.addEventListener('click', function() {
    // videoContainer의 display 속성을 'block'으로 설정합니다.
    videoContainer.style.display = "block";
    recordedVideo.style.display = "none";
    
});
myvideoButton.addEventListener('click', function() {
    recordedVideo.style.display = "block";
    videoContainer.style.display = "none";
});

// "학습" 모드로 설정
function setLearningMode() {
    wordNumberDiv.style.display = "block";  // 단어 선택 옵션을 표시
    sentenceNumberDiv.classList.remove("show");
    squareBox1.classList.add("learning-mode");
    title1.innerHTML = "<h7>학습</h7>";
    videoContainer.style.display = "block"; 
    videoContainer.classList.add("learning-mode");
    videoNumberElement.style.display = 'none'; //영상 번호 옵션 숨기기
    startElement.style.display = 'none'; //시작 버튼 숨기기
    document.querySelector('label[for="sentence-number"]').style.display = "block";
    document.getElementById('sentence-number').style.display = 'block';
    document.querySelector('label[for="word-number"]').style.display = "block";
    document.getElementById('word-number').style.display = 'block';
    // 웹캠 중지 로직 추가
    let video = document.getElementById('webcam');
    if (video) {
        let stream = video.srcObject;
        if (stream) {
            let tracks = stream.getTracks();
            if (tracks && tracks.length > 0) {
                tracks.forEach(function(track) {
                    track.stop();
                });
            }
        }
        video.style.display = 'none';
    }
    timerDiv.style.display = "none";  // 타이머 숨기기
    resultButton.style.display = "none";  // 결과 버튼 숨기기
    returnButton.style.display = "none";  // 돌아가기 버튼 숨기기
    answerButton.style.display = "none"; //정답 버튼 숨기기
    myvideoButton.style.display = "none"; //내 영상 버튼 숨기기
    recordedVideo.style.display = "none";
    scoreElement.style.display = 'none';
}
// "연습" 모드로 설정
function setPracticeMode() {
    videoNumberElement.style.display = 'block'; //영상 번호 옵션 표시
    startElement.style.display = 'block'; //시작 버튼 표시
    optionsElement.style.display = "block";
    inputTypeElement.style.display = "block";
    dayElement.style.display = "block";
    title1.innerHTML = "<h7>연습</h7>";
    videoContainer.style.display = "none";
    // 이전에 시작했던 미디어 스트림을 중지하고 제거
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    // 웹캠 스트림 다시 시작
    startWebcam();
    document.querySelector('label[for="sentence-number"]').style.display = "none";
    document.getElementById('sentence-number').style.display = 'none';
    document.querySelector('label[for="word-number"]').style.display = "none";
    document.getElementById('word-number').style.display = 'none';
    timerDiv.style.display = "block";  // 타이머 보이기
    returnButton.style.display = "none";  // 돌아가기 버튼 숨기기
    answerButton.style.display = "none"; //정답 버튼 숨기기
    myvideoButton.style.display = "none"; //내 영상 버튼 숨기기
    recordedVideo.style.display = "none";
    scoreElement.style.display = 'none';
}
//"결과" 모드로 설정
function setResultMode() {
    title1.innerHTML = "<h7>결과</h7>";
    wordNumberDiv.style.display = "none"; //단어 선택 옵션 숨기기
    sentenceNumberDiv.style.display = "none"; //문장 선택 옵션 숨기기
    videoNumberElement.style.display = 'none'; //영상 번호 옵션 숨기기
    startElement.style.display = 'none'; //시작 버튼 숨기기
    videoContainer.style.display = "none";
    resultButton.style.display = "none";  // 결과 버튼 숨기기
    optionsElement.style.display = "none";
    inputTypeElement.style.display = "none";
    // 웹캠 중지 로직 추가
   let video = document.getElementById('webcam');
   if (video) {
       let stream = video.srcObject;
       if (stream) {
           let tracks = stream.getTracks();
           if (tracks && tracks.length > 0) {
               tracks.forEach(function(track) {
                   track.stop();
               });
           }
       }
       video.style.display = 'none';
   }
    dayElement.style.display = "none";
    timerDiv.style.display = "none";  // 타이머 숨기기
    returnButton.style.display = "block";  // 돌아가기 버튼 보이기
    answerButton.style.display = "block"; //정답 버튼 보이기
    myvideoButton.style.display = "block"; //내 영상 버튼 보이기
    recordedVideo.style.display = "block";
    scoreElement.style.display = 'block';
}

// 학습,연습 모드 변경 시 이벤트 리스너 등록
learningRadio.addEventListener("change", setLearningMode);
practiceRadio.addEventListener("change", setPracticeMode);
resultButton.addEventListener("click", setResultMode);

// 페이지 로드 시 초기 모드 설정
if (learningRadio.checked) {
    setLearningMode();
}

// square-box1 요소
var squareBox1 = document.querySelector(".square-box1");

// square-box1의 높이를 비디오 요소의 높이로 설정
function setVideoHeight() {
    var videoElement = document.querySelector(".video video"); // videoContainer 내부의 video 요소
    videoElement.style.height = squareBox1.offsetHeight + "px";
}

// 윈도우 크기 변경 시 비디오 높이 재설정
window.addEventListener("resize", setVideoHeight);

// 페이지 로드 시 비디오 높이 설정
setVideoHeight();