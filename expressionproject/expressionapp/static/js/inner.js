var homeButton = document.getElementById("homeButton");
homeButton.addEventListener("click", function(event) {
  event.preventDefault();
  window.location.href = "/main/";
});

var aboutButton = document.getElementById("aboutButton");
aboutButton.addEventListener("click", function(event) {
  event.preventDefault();
  window.location.href = "/about/";
});

var contactButton = document.getElementById("LearningButton");
contactButton.addEventListener("click", function(event) {
  event.preventDefault();
  window.location.href = "/learning/";
});