window.onload = function () {
  var mouseX = {
    stabilizeActive: false,
    dirUpActive: false,
    dirDownActive: false,
    dirLeftActive: false,
    dirRightActive: false,

    clientSpeedX: 0,
    clientSpeedY: 0,
    speedIncrements: 0.1,

    clientX: 0,
    clientY: 0,

    newDiv: document.createElement("div"),
    body: document.querySelector("body"),

    mouseXActive: false,

    screenWidth: 0,
    screenHeight: 0,
    windowWidth: 0,
    windowHeight: 0,

    scrollTop: 0,
    scrollLeft: 0,

    getScreenSize() {
      this.screenWidth = this.body.scrollWidth;
      this.screenHeight = this.body.scrollHeight; // there's also scrollHeight... might be taller?
    },
    getWindowSize() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    },
    handleKeyDown(e) {
      // cmd = 91, ctrl = 17
      if (e.keyCode === 91 || e.keyCode === 17) {
        this.commandKey = true;
      }

      if (e.keyCode === 88 && this.commandKey) {
        if (!this.mouseXActive) {
          console.log("activating MouseX");
          this.mouseXActive = true;
          this.clientSpeedX = 0;
          this.clientSpeedY = 0;
          var plugin = this;

          this.mainLoopToggler = setInterval(() => {
            this.mainLoop(plugin);
          }, 10);
        } else {
          console.log("deactivating MouseX");
          this.mouseXActive = false;

          clearInterval(this.mainLoopToggler);
          this.mainLoopToggler = null;
        }
      }

      if (e.keyCode === 87 || e.keyCode === 38) {
        this.dirUpActive = true;
      }
      if (e.keyCode === 83 || e.keyCode === 40) {
        this.dirDownActive = true;
      }
      if (e.keyCode === 65 || e.keyCode === 37) {
        this.dirLeftActive = true;
      }
      if (e.keyCode === 68 || e.keyCode === 39) {
        this.dirRightActive = true;
      }
      if (e.keyCode === 81) {
        this.stabilizeActive = true;
      }

      // e = 69 //simulate click
      if (e.keyCode === 69) {
        var element = document.elementFromPoint(
          this.clientX,
          this.clientY - this.scrollTop
        );
        console.log("click!");
        console.log(this.clientX, this.clientY);
        console.log(element);
        console.log(element.nodeName);
        // element.click();

        if (element.nodeName == "A") {
          element.click();
        } else if (
          element.nodeName == "INPUT" ||
          element.nodeName == "TEXTAREA"
        ) {
          element.focus();
        }
      }
    },
    handleKeyUp(e) {
      if (e.keyCode === 87 || e.keyCode === 38) {
        this.dirUpActive = false;
      }
      if (e.keyCode === 83 || e.keyCode === 40) {
        this.dirDownActive = false;
      }
      if (e.keyCode === 65 || e.keyCode === 37) {
        this.dirLeftActive = false;
      }
      if (e.keyCode === 68 || e.keyCode === 39) {
        this.dirRightActive = false;
      }
      if (e.keyCode === 81) {
        this.stabilizeActive = false;
      }
    },
    addEventListeners() {
      var plugin = this;

      document.addEventListener("keydown", function (e) {
        plugin.handleKeyDown(e);
      });

      document.addEventListener("keyup", function (e) {
        plugin.handleKeyUp(e);
      });
    },
    stabilize() {
      // stabilize x-axis
      if (this.clientSpeedX > 0) {
        this.clientSpeedX -= this.speedIncrements;
      } else if (this.clientSpeedX < 0) {
        this.clientSpeedX += this.speedIncrements;
      }

      // stabilize y-axis
      if (this.clientSpeedY > 0) {
        this.clientSpeedY -= this.speedIncrements;
      } else if (this.clientSpeedY < 0) {
        this.clientSpeedY += this.speedIncrements;
      }

      // stabilize to exactly zero if very close
      if (
        Math.abs(this.clientSpeedX) <= 1 &&
        Math.abs(this.clientSpeedY) <= 1
      ) {
        this.clientSpeedX = 0;
        this.clientSpeedY = 0;
      }
    },
    accelerateUp() {
      this.clientSpeedY -= this.speedIncrements;
    },
    accelerateDown() {
      this.clientSpeedY += this.speedIncrements;
    },
    accelerateLeft() {
      this.clientSpeedX -= this.speedIncrements;
    },
    accelerateRight() {
      this.clientSpeedX += this.speedIncrements;
    },
    bounce() {
      // left boundary bounce
      if (this.clientX < 0 && this.clientSpeedX < 0) {
        this.clientSpeedX = Math.abs(this.clientSpeedX);
      }

      // top boundary bounce
      if (this.clientY < 0 && this.clientSpeedY < 0) {
        this.clientSpeedY = Math.abs(this.clientSpeedY);
      }

      // right boundary bounce
      if (this.clientX > this.screenWidth && this.clientSpeedX > 0) {
        this.clientSpeedX = -Math.abs(this.clientSpeedX);
      }

      // bottom boundary bounce
      if (this.clientY > this.screenHeight && this.clientSpeedY > 0) {
        this.clientSpeedY = -Math.abs(this.clientSpeedY);
      }
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
    scroll() {
      this.getScrollTop();

      // scroll up if UFO goes off screen
      if (this.clientY < this.scrollTop && this.clientSpeedY < 0) {
        window.scroll(0, this.clientY);
      }

      // scroll down if UFO goes off screen
      if (
        this.clientY > this.scrollTop + this.windowHeight &&
        this.clientSpeedY > 0
      ) {
        window.scroll(0, this.clientY - this.windowHeight);
      }
    },
    mainLoop(plugin) {
      if (plugin.stabilizeActive) {
        this.stabilize();
      }
      if (plugin.dirUpActive) {
        plugin.accelerateUp();
      }
      if (plugin.dirDownActive) {
        plugin.accelerateDown();
      }
      if (plugin.dirLeftActive) {
        plugin.accelerateLeft();
        plugin.newDiv.style.transform = "rotate(-45deg)";
      }
      if (plugin.dirRightActive) {
        plugin.accelerateRight();
        plugin.newDiv.style.transform = "rotate(45deg)";
      }
      if (!plugin.dirLeftActive && !plugin.dirRightActive) {
        plugin.newDiv.style.transform = "rotate(0deg)";
      }

      plugin.bounce();
      plugin.scroll();

      // move UFO
      plugin.clientX += plugin.clientSpeedX;
      plugin.clientY += plugin.clientSpeedY;

      // alter display
      plugin.newDiv.style.left = plugin.clientX - 25; // width is 50, so centres it
      plugin.newDiv.style.top = plugin.clientY - 50; // height is 50, so bottom is the point
    },
    init() {
      this.newDiv = document.querySelector(".ufo");

      this.getScreenSize();
      this.getWindowSize();

      this.addEventListeners();
    },
  };

  mouseX.init();
};

// to incorporate later:
// blur() {
//   document.querySelectorAll("input,textarea").forEach(function (element) {
//     if (element === document.activeElement) {
//       return element.blur();
//     }
//   });
// },
