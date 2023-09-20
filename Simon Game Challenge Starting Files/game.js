buttonColours = ["red", "blue", "green", "yellow"];
gamePattern=[];
userClickedPattern=[];

var gameStarted = false;
var level = 0;


$(document).keypress(function() {
    if (!gameStarted) {
  
      $("#level-title").text("Level " + level);
      nextSequence();
      gameStarted = true;
    }
  });


$(".btn").click(function() {
    var userChosenColour = $(this).attr("id");
    userClickedPattern.push(userChosenColour);
    playSound(userChosenColour);
    animatePress(userChosenColour);
    
    checkAnswer(userClickedPattern.length-1);
});

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel]===userClickedPattern[currentLevel]) {
    

    if (gamePattern.length===userClickedPattern.length) {
      setTimeout(function(){
        nextSequence();
      },1000);
    }
  }
  else{
    var wrongAudio = new Audio("sounds/wrong.mp3");
    wrongAudio.play();
    $("body").addClass("game-over");
    setTimeout(function(){
      $("body").addClass("game-over");
      $("body").removeClass("game-over");
    },200);
    $("h1").text("Game Over, Press Any Key to Restart");
    startOver()
  }

  
}
function startOver(){
  level = 0;
  gamePattern =[];
  gameStarted = false;


}

function nextSequence() {

    userClickedPattern=[];

    level++;
    $("#level-title").text("Level " + level);


    var  randomNumber = Math.floor(Math.random()*4);
    var randomChosenColour = buttonColours[randomNumber];
    gamePattern.push(randomChosenColour);

    $("#"+randomChosenColour).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    playSound(randomChosenColour); 
  
}

function playSound(name) {
    var audio = new Audio("sounds/" + name + ".mp3");
    audio.play();
  }

function animatePress(currentColour){
    var activeButton =  document.querySelector("."+currentColour)
    $(activeButton).addClass("pressed");
    setTimeout(function(){
        $(".btn").removeClass('pressed');
}, 100);

}




