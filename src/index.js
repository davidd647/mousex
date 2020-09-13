import $ from "jquery";

var mouseX = {
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

    scrollTop: 0,
    // scrollLeft: 0,

    rocketHeight: 50,
    rocketWidth: 50,

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
  getScrollTop: function () {
    this.scrollTop =
      window.pageYOffset !== undefined
        ? window.pageYOffset
        : (
            document.documentElement ||
            document.body.parentNode ||
            document.body
          ).scrollTop;
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

      $(".rocket").css("left", plugin.clientX - 25);
      $(".rocket").css("top", plugin.clientY - 50);
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
    if (this.clientX < 25 && this.settings.clientSpeedX < 0) {
      this.settings.clientSpeedX = Math.abs(this.settings.clientSpeedX);
    }
    if (this.clientY < 50 && this.settings.clientSpeedY < 0) {
      this.settings.clientSpeedY = Math.abs(this.settings.clientSpeedY);
    }
    if (
      this.clientX - 25 >
        this.settings.screenWidth - this.settings.rocketWidth &&
      this.settings.clientSpeedX > 0
    ) {
      this.settings.clientSpeedX = -Math.abs(this.settings.clientSpeedX);
    }
    if (
      this.clientY - 50 >
        this.settings.screenHeight - this.settings.rocketHeight &&
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
    this.getScrollTop();

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
    if (this.clientY - 50 < this.scrollTop && this.settings.clientSpeedY < 0) {
      window.scroll(0, this.clientY - 50);
    }

    this.clientY += this.settings.clientSpeedY;
    this.clientX += this.settings.clientSpeedX;

    $(".rocket").css("top", this.clientY - 50);
    $(".rocket").css("left", this.clientX - 25);
  },

  init: function () {
    this.getScreenSize();
    this.getWindowSize();

    this.clientX = this.windowWidth / 2;
    this.clientY = this.windowHeight / 2;

    this.getScrollTop();

    $("body").append("<div class='rocket d-none'><div></div></div>");

    this.addEventListeners();

    // mainLoop is activated via an event listener ⬆
  },
};

mouseX.init();
