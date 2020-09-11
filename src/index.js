import $ from "jquery";

var myPlugin = {
  settings: {
    rocketActive: false,

    clientSpeedX: 0,
    clientSpeedY: 0,
    speedIncrements: 0.1,

    upActive: false,
    downActive: false,
    leftActive: false,
    rightActive: false,
    stabilizeActive: false,

    screenWidth: 0,
    screenHeight: 0,

    // scrollTop: 0,
    // scrollLeft: 0,

    rocketHeight: 30,
    rocketWidth: 30,

    screenWidth: 0,
    screenHeight: 0,

    windowWidth: 0,
    windowHeight: 0,

    mainLoopToggler: null,
  },
  getScreenSize: function () {
    this.settings.screenWidth = $("body").width();
    this.settings.screenHeight = $("body").height();
  },
  getWindowSize: function () {
    this.settings.windowWidth = $(window).width();
    // $(window).height(); doesn't gives body height... weird, right?
    this.settings.windowHeight = window.innerHeight;
  },

  accelerateUp: function () {
    this.settings.clientSpeedY -= this.settings.speedIncrements;
  },
  accelerateLeft: function () {
    this.settings.clientSpeedX -= this.settings.speedIncrements;
  },
  accelerateDown: function () {
    this.settings.clientSpeedY += this.settings.speedIncrements;
  },
  accelerateRight: function () {
    this.settings.clientSpeedX += this.settings.speedIncrements;
  },

  stabilize: function () {
    if (this.settings.clientSpeedX > 0) {
      this.settings.clientSpeedX -= this.settings.speedIncrements;
    } else if (this.settings.clientSpeedX < 0) {
      this.settings.clientSpeedX += this.settings.speedIncrements;
    }

    if (this.settings.clientSpeedY > 0) {
      this.settings.clientSpeedY -= this.settings.speedIncrements;
    } else if (this.settings.clientSpeedY < 0) {
      this.settings.clientSpeedY += this.settings.speedIncrements;
    }

    if (
      Math.abs(this.settings.clientSpeedX) <= 1 &&
      Math.abs(this.settings.clientSpeedY) <= 1
    ) {
      this.settings.clientSpeedX = 0;
      this.settings.clientSpeedY = 0;
    }
  },

  handleKeyDown: function (e) {
    // cmd = 91, ctrl = 17
    if (e.keyCode === 91 || e.keyCode === 17) {
      this.commandKey = true;
    }

    // x = 88 - - - toggle rocket display
    if (e.keyCode === 88 && this.commandKey) {
      // make cursor disappear by adding CSS class to body
      if (!this.rocketActive) {
        console.log($(this));
        $("body").addClass("cursor-hidden");
        $(".rocket").removeClass("d-none");
        this.clientSpeedX = 0;
        this.clientSpeedY = 0;
        this.rocketActive = true;
        $(":focus").blur();
      } else {
        $("body").removeClass("cursor-hidden");
        $(".rocket").addClass("d-none");
        this.rocketActive = false;
      }

      if (this.settings.mainLoopToggler == null) {
        this.settings.mainLoopToggler = setInterval(
          () => this.mainLoop(this),
          10
        );
      } else {
        clearInterval(this.settings.mainLoopToggler);
        this.settings.mainLoopToggler = null;
      }
    }

    // don't register speed changes if the saucer is inactive
    if (!this.rocketActive) {
      return;
    }

    // w = 87 - go up... s = 83 - go down... a = 65 - go left...
    // d = 68 - go right... q = 81 stabilize
    if (e.keyCode === 87 || e.keyCode === 38) {
      this.settings.upActive = true;
    }
    if (e.keyCode === 83 || e.keyCode === 40) {
      this.settings.downActive = true;
    }
    if (e.keyCode === 65 || e.keyCode === 37) {
      this.settings.leftActive = true;
    }
    if (e.keyCode === 68 || e.keyCode === 39) {
      this.settings.rightActive = true;
    }
    if (e.keyCode === 81) {
      this.settings.stabilizeActive = true;
    }

    // e = 69 //simulate click
    if (e.keyCode === 69) {
      var element = document.elementFromPoint(
        this.clientX,
        this.clientY - this.scrollTop
      );
      console.log("click!");
      console.log(this.clientX, this.clientY);
      console.log($(element));
      if ($(element).is("textarea, input")) {
        $(element).focus();
      } else {
        // disable scrolling based on rocket position
        this.clientY = null;
        $(element)[0].click();
        // reinstate rocket position
        this.clientY = this.scrollTop;
      }
    }
  },
  handleKeyUp: function (e) {
    if (e.keyCode === 91) {
      this.commandKey = false;
    }

    // w = 87... s = 83... a = 65... d = 68... q = 81
    if (e.keyCode === 87 || e.keyCode === 38) {
      this.settings.upActive = false;
    }
    if (e.keyCode === 83 || e.keyCode === 40) {
      this.settings.downActive = false;
    }
    if (e.keyCode === 65 || e.keyCode === 37) {
      this.settings.leftActive = false;
    }
    if (e.keyCode === 68 || e.keyCode === 39) {
      this.settings.rightActive = false;
    }
    if (e.keyCode === 81) {
      this.settings.stabilizeActive = false;
    }
  },

  addEventListeners: function () {
    var plugin = this;
    $("body").on("keydown", function (e) {
      plugin.handleKeyDown(e);
    });
    $("body").on("keyup", function (e) {
      plugin.handleKeyUp(e);
    });

    $("body").on("mousemove", function (e) {
      plugin.clientX = e.clientX;
      plugin.clientY = e.clientY + plugin.scrollTop;

      $(".rocket").css("left", plugin.clientX);
      $(".rocket").css("top", plugin.clientY);
    });
  },

  mainLoop: function () {
    if (this.settings.stabilizeActive) {
      this.stabilize();
    }

    if (this.settings.upActive) {
      this.accelerateUp();
    }
    if (this.settings.downActive) {
      this.accelerateDown();
    }
    if (this.settings.leftActive) {
      this.accelerateLeft();
    }
    if (this.settings.rightActive) {
      this.accelerateRight();
    }

    // ship tilts left
    if (this.settings.leftActive && !this.settings.rightActive) {
      $(".rocket").addClass("rocket-left");
    } else {
      $(".rocket").removeClass("rocket-left");
    }

    // ship tilts right
    if (this.settings.rightActive && !this.settings.leftActive) {
      $(".rocket").addClass("rocket-right");
    } else {
      $(".rocket").removeClass("rocket-right");
    }

    // bounce:
    if (this.clientX < 0 && this.settings.clientSpeedX < 0) {
      this.settings.clientSpeedX = Math.abs(this.settings.clientSpeedX);
    }
    if (this.clientY < 0 && this.settings.clientSpeedY < 0) {
      this.settings.clientSpeedY = Math.abs(this.settings.clientSpeedY);
    }
    if (
      this.clientX > this.settings.screenWidth - this.settings.rocketWidth &&
      this.settings.clientSpeedX > 0
    ) {
      this.settings.clientSpeedX = -Math.abs(this.settings.clientSpeedX);
    }
    if (
      this.clientY > this.settings.screenHeight - this.settings.rocketHeight &&
      this.settings.clientSpeedY > 0
    ) {
      this.settings.clientSpeedY = -Math.abs(this.settings.clientSpeedY);
    }

    // scrollLeft and scrollTop algorithms copied from
    // https://stackoverflow.com/questions/11373741/detecting-by-how-much-user-has-scrolled
    this.scrollLeft =
      window.pageXOffset !== undefined
        ? window.pageXOffset
        : (
            document.documentElement ||
            document.body.parentNode ||
            document.body
          ).scrollLeft;
    this.scrollTop =
      window.pageYOffset !== undefined
        ? window.pageYOffset
        : (
            document.documentElement ||
            document.body.parentNode ||
            document.body
          ).scrollTop;

    if (!this.rocketActive) {
      return;
    }

    // scrollTop = how far down the document have you scrolled?
    // clientY = how far down the document is the cursor?
    // windowHeight = how tall is the window

    // scroll with UFO to bottom...
    if (
      this.clientY + this.settings.rocketHeight >
        this.scrollTop + this.settings.windowHeight &&
      this.settings.clientSpeedY > 0
    ) {
      window.scroll(
        0,
        this.clientY + this.settings.rocketHeight - this.settings.windowHeight
      );
    }

    // scroll with UFO to top...
    if (this.clientY < this.scrollTop && this.settings.clientSpeedY < 0) {
      window.scroll(0, this.clientY);
    }

    this.clientY += this.settings.clientSpeedY;
    this.clientX += this.settings.clientSpeedX;

    $(".rocket").css("top", this.clientY);
    $(".rocket").css("left", this.clientX);
  },

  init: function () {
    this.getScreenSize();
    this.getWindowSize();

    this.clientX = this.windowWidth / 2;
    this.clientY = this.windowHeight / 2;

    $("body").append("<div class='rocket d-none'></div>");

    this.addEventListeners();

    // mainLoop is activated via an event listener ⬆
  },
};

myPlugin.init();

// IIFE to keep all these method calls separate from anything the user adds on the homepage, though...

// IIFE... should look into how to start this with some parameters...
// I think that's something you get with figuring out how to use requirejs...

// (function () {
//   var rocketActive = false;

//   var clientSpeedX = 0;
//   var clientSpeedY = 0;
//   var speedIncrements = 0.1;

//   var upActive = false;
//   var downActive = false;
//   var leftActive = false;
//   var rightActive = false;
//   var stabilizeActive = false;

//   var screenWidth = 0;
//   var screenHeight = 0;

//   var scrollTop = 0;
//   var scrollLeft = 0;

//   var rocketHeight = 30;
//   var rocketWidth = 30;

//   function getScreenSize() {
//     screenWidth = $("body").width();
//     screenHeight = $("body").height();
//   }

//   getScreenSize();

//   var windowWidth = 0;
//   var windowHeight = 0;

//   function getWindowSize() {
//     windowWidth = $(window).width();
//     // $(window).height(); doesn't gives body height... weird, right?
//     windowHeight = window.innerHeight;
//   }

//   getWindowSize();

//   var clientX = windowWidth / 2;
//   var clientY = windowHeight / 2;

//   $("body").append("<div class='rocket d-none'></div>");

//   function accelerateUp() {
//     clientSpeedY -= speedIncrements;
//   }

//   function accelerateLeft() {
//     clientSpeedX -= speedIncrements;
//   }

//   function accelerateDown() {
//     clientSpeedY += speedIncrements;
//   }

//   function accelerateRight() {
//     clientSpeedX += speedIncrements;
//   }

//   function stabilize() {
//     if (clientSpeedX > 0) {
//       clientSpeedX -= speedIncrements;
//     } else if (clientSpeedX < 0) {
//       clientSpeedX += speedIncrements;
//     }

//     if (clientSpeedY > 0) {
//       clientSpeedY -= speedIncrements;
//     } else if (clientSpeedY < 0) {
//       clientSpeedY += speedIncrements;
//     }

//     if (Math.abs(clientSpeedX) <= 1 && Math.abs(clientSpeedY) <= 1) {
//       clientSpeedX = 0;
//       clientSpeedY = 0;
//     }
//   }

//   var mainLoopToggler = null; // instantiate mainLoopToggler for access later...
//   function mainLoop() {
//     if (stabilizeActive) {
//       stabilize();
//     }
//     if (upActive) {
//       accelerateUp();
//     }
//     if (downActive) {
//       accelerateDown();
//     }
//     if (leftActive) {
//       accelerateLeft();
//     }
//     if (rightActive) {
//       accelerateRight();
//     }

//     // ship tilts left
//     if (leftActive && !rightActive) {
//       $(".rocket").addClass("rocket-left");
//     } else {
//       $(".rocket").removeClass("rocket-left");
//     }

//     // ship tilts right
//     if (rightActive && !leftActive) {
//       $(".rocket").addClass("rocket-right");
//     } else {
//       $(".rocket").removeClass("rocket-right");
//     }

//     // bounce:
//     if (clientX < 0 && clientSpeedX < 0) {
//       clientSpeedX = -clientSpeedX;
//     }
//     if (clientY < 0 && clientSpeedY < 0) {
//       clientSpeedY = -clientSpeedY;
//     }
//     if (clientX > screenWidth && clientSpeedX > 0) {
//       clientSpeedX = -clientSpeedX;
//     }
//     if (clientY > screenHeight && clientSpeedY > 0) {
//       clientSpeedY = -clientSpeedY;
//     }

//     // scrollLeft and scrollTop algorithms copied from
//     // https://stackoverflow.com/questions/11373741/detecting-by-how-much-user-has-scrolled
//     scrollLeft =
//       window.pageXOffset !== undefined
//         ? window.pageXOffset
//         : (
//             document.documentElement ||
//             document.body.parentNode ||
//             document.body
//           ).scrollLeft;
//     scrollTop =
//       window.pageYOffset !== undefined
//         ? window.pageYOffset
//         : (
//             document.documentElement ||
//             document.body.parentNode ||
//             document.body
//           ).scrollTop;

//     if (!rocketActive) {
//       return;
//     }

//     if (
//       clientY + rocketHeight > windowHeight &&
//       scrollTop < clientY + rocketHeight - windowHeight
//     ) {
//       window.scroll(0, clientY + rocketHeight - windowHeight);
//     } else if (clientY < scrollTop) {
//       window.scroll(0, clientY);
//     }

//     clientY += clientSpeedY;
//     clientX += clientSpeedX;

//     $(".rocket").css("top", clientY);
//     $(".rocket").css("left", clientX);
//   }

//   var commandKey = false;

//   // usable keys: x, w, a, s, d, ⬆️, ⬅️, ⬇️, ➡️, q, c
//   $("body").on("keydown", function (e) {
//     // cmd = 91, ctrl = 17
//     if (e.keyCode === 91 || e.keyCode === 17) {
//       commandKey = true;
//     }

//     // x = 88 - - - toggle rocket display
//     if (e.keyCode === 88 && commandKey) {
//       // make cursor disappear by adding CSS class to body
//       if (!rocketActive) {
//         $(this).addClass("cursor-hidden");
//         $(".rocket").removeClass("d-none");
//         clientSpeedX = 0;
//         clientSpeedY = 0;
//         rocketActive = true;
//         $(":focus").blur();
//       } else {
//         $(this).removeClass("cursor-hidden");
//         $(".rocket").addClass("d-none");
//         rocketActive = false;
//       }

//       if (mainLoopToggler == null) {
//         mainLoopToggler = setInterval(mainLoop, 10);
//       }
//     }

//     // don't register speed changes if the saucer is inactive
//     if (!rocketActive) {
//       return;
//     }

//     // w = 87; ⬆️ = 38 - - - accelerate up
//     if (e.keyCode === 87 || e.keyCode === 38) {
//       upActive = true;
//     }
//     // s = 83; ⬇️ = 40 - - - accelerate down
//     if (e.keyCode === 83 || e.keyCode === 40) {
//       downActive = true;
//     }
//     // a = 65; ⬅️ = 37 - - - accelerate left
//     if (e.keyCode === 65 || e.keyCode === 37) {
//       leftActive = true;
//     }
//     // d = 68; ➡️  = 39 - - - accelerate right
//     if (e.keyCode === 68 || e.keyCode === 39) {
//       rightActive = true;
//     }
//     // q = 81 //stabilize ship
//     if (e.keyCode === 81) {
//       stabilizeActive = true;
//     }
//     // e = 69 //simulate click
//     if (e.keyCode === 69) {
//       console.log("click!");
//       var element = document.elementFromPoint(clientX, clientY - scrollTop);
//       console.log(clientX, clientY);
//       console.log($(element));
//       if ($(element).is("textarea, input")) {
//         $(element).focus();
//       } else {
//         // disable scrolling based on rocket position
//         clientY = null;
//         $(element)[0].click();
//         // reinstate rocket position
//         clientY = scrollTop;
//       }
//     }
//   });

//   $("body").on("keyup", function (e) {
//     if (e.keyCode === 91) {
//       commandKey = false;
//     }

//     // w = 87; ⬆️ = 38
//     if (e.keyCode === 87 || e.keyCode === 38) {
//       upActive = false;
//     }
//     // s = 83; ⬇️ = 40
//     if (e.keyCode === 83 || e.keyCode === 40) {
//       downActive = false;
//     }
//     // a = 65; ⬅️ = 37
//     if (e.keyCode === 65 || e.keyCode === 37) {
//       leftActive = false;
//     }
//     // d = 68; ➡️  = 39
//     if (e.keyCode === 68 || e.keyCode === 39) {
//       rightActive = false;
//     }
//     // q = 81
//     if (e.keyCode === 81) {
//       stabilizeActive = false;
//     }
//   });

//   $("body").on("mousemove", function (e) {
//     clientX = e.clientX;
//     clientY = e.clientY + scrollTop;
//     $(".rocket").css("left", clientX);
//     $(".rocket").css("top", clientY);
//   });
// })();
