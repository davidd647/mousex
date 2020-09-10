var rocketActive = false;

var clientSpeedX = 0;
var clientSpeedY = 0;
var speedIncrements = 0.1;

var upActive = false;
var downActive = false;
var leftActive = false;
var rightActive = false;
var stabilizeActive = false;

var screenWidth = 0;
var screenHeight = 0;

var scrollTop = 0;
var scrollLeft = 0;

function getScreenSize() {
  screenWidth = $("body").width();
  screenHeight = $("body").height();
}

getScreenSize();

var windowWidth = 0;
var windowHeight = 0;

function getWindowSize() {
  windowWidth = $(window).width();
  // $(window).height(); doesn't gives body height... weird, right?
  windowHeight = window.innerHeight;
}

getWindowSize();

var clientX = screenWidth / 2;
var clientY = screenHeight / 2;

$("body").append("<div class='rocket d-none'></div>");

function accelerateUp() {
  clientSpeedY -= speedIncrements;
}

function accelerateLeft() {
  clientSpeedX -= speedIncrements;
}

function accelerateDown() {
  clientSpeedY += speedIncrements;
}

function accelerateRight() {
  clientSpeedX += speedIncrements;
}

function stabilize() {
  if (clientSpeedX > 0) {
    clientSpeedX -= speedIncrements;
  } else if (clientSpeedX < 0) {
    clientSpeedX += speedIncrements;
  }

  if (clientSpeedY > 0) {
    clientSpeedY -= speedIncrements;
  } else if (clientSpeedY < 0) {
    clientSpeedY += speedIncrements;
  }

  if (Math.abs(clientSpeedX) <= 1 && Math.abs(clientSpeedY) <= 1) {
    clientSpeedX = 0;
    clientSpeedY = 0;
  }
}

var mainLoopToggler = null; // instantiate mainLoopToggler for access later...
function mainLoop() {
  if (stabilizeActive) {
    stabilize();
  }
  if (upActive) {
    accelerateUp();
  }
  if (downActive) {
    accelerateDown();
  }
  if (leftActive) {
    accelerateLeft();
  }
  if (rightActive) {
    accelerateRight();
  }

  // bounce:
  if (clientX < 0 && clientSpeedX < 0) {
    clientSpeedX = -clientSpeedX;
  }
  if (clientY < 0 && clientSpeedY < 0) {
    clientSpeedY = -clientSpeedY;
  }
  if (clientX > screenWidth && clientSpeedX > 0) {
    clientSpeedX = -clientSpeedX;
  }
  if (clientY > screenHeight && clientSpeedY > 0) {
    clientSpeedY = -clientSpeedY;
  }

  // scrollLeft and scrollTop algorithms copied from
  // https://stackoverflow.com/questions/11373741/detecting-by-how-much-user-has-scrolled
  scrollLeft =
    window.pageXOffset !== undefined
      ? window.pageXOffset
      : (document.documentElement || document.body.parentNode || document.body)
          .scrollLeft;
  scrollTop =
    window.pageYOffset !== undefined
      ? window.pageYOffset
      : (document.documentElement || document.body.parentNode || document.body)
          .scrollTop;

  if (clientY > windowHeight && scrollTop < clientY - windowHeight) {
    window.scroll(0, clientY - windowHeight);
  } else if (clientY < scrollTop) {
    window.scroll(0, clientY);
  }

  clientY += clientSpeedY;
  clientX += clientSpeedX;

  $(".rocket").css("top", clientY);
  $(".rocket").css("left", clientX);
}

var commandKey = false;

// usable keys: x, w, a, s, d, ⬆️, ⬅️, ⬇️, ➡️, q, c
$("body").on("keydown", function (e) {
  // cmd = 91
  if (e.keyCode === 91) {
    commandKey = true;
  }

  // x = 88 - - - toggle rocket display
  if (e.keyCode === 88 && commandKey) {
    // in case the user is focused on a textarea or something

    console.log(clientX);
    console.log(clientY);

    // make cursor disappear by adding CSS class to body
    if (!rocketActive) {
      $(this).addClass("cursor-hidden");
      $(".rocket").removeClass("d-none");
      rocketActive = true;
      $(":focus").blur();
    } else {
      $(this).removeClass("cursor-hidden");
      $(".rocket").addClass("d-none");
      rocketActive = false;
    }

    if (mainLoopToggler == null) {
      mainLoopToggler = setInterval(mainLoop, 10);
    }
  }

  console.log(e.keyCode, e.key);

  // w = 87; ⬆️ = 38 - - - accelerate up
  if (e.keyCode === 87 || e.keyCode === 38) {
    upActive = true;
  }
  // s = 83; ⬇️ = 40 - - - accelerate down
  if (e.keyCode === 83 || e.keyCode === 40) {
    downActive = true;
  }
  // a = 65; ⬅️ = 37 - - - accelerate left
  if (e.keyCode === 65 || e.keyCode === 37) {
    leftActive = true;
  }
  // d = 68; ➡️  = 39 - - - accelerate right
  if (e.keyCode === 68 || e.keyCode === 39) {
    rightActive = true;
  }
  // q = 81 //stabilize ship
  if (e.keyCode === 81) {
    stabilizeActive = true;
  }
  // c = 67 //click
  if (e.keyCode === 67) {
    console.log("click!");
    var element = document.elementFromPoint(clientX, clientY - scrollTop);
    console.log(clientX, clientY);
    console.log($(element));
    if ($(element).is("textarea, input")) {
      $(element).focus();
    } else {
      $(element)[0].click();
    }
  }

  // p = 80 - - - toggle rocket pause
});

$("body").on("keyup", function (e) {
  if (e.keyCode === 91) {
    commandKey = false;
  }

  // w = 87; ⬆️ = 38
  if (e.keyCode === 87 || e.keyCode === 38) {
    upActive = false;
  }
  // s = 83; ⬇️ = 40
  if (e.keyCode === 83 || e.keyCode === 40) {
    downActive = false;
  }
  // a = 65; ⬅️ = 37
  if (e.keyCode === 65 || e.keyCode === 37) {
    leftActive = false;
  }
  // d = 68; ➡️  = 39
  if (e.keyCode === 68 || e.keyCode === 39) {
    rightActive = false;
  }
  // q = 81
  if (e.keyCode === 81) {
    stabilizeActive = false;
  }
});

$("body").on("mousemove", function (e) {
  clientX = e.clientX;
  clientY = e.clientY + scrollTop;
  $(".rocket").css("left", clientX);
  $(".rocket").css("top", clientY + scrollTop);

  console.log(e.clientY + scrollTop);
});

$("#test-link").on("click", function () {
  console.log("I was clicked!");
});
