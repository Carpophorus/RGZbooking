(function(global) {
  RGZ = {};

  RGZ.nav = 0;
  RGZ.mobileButtonClicked = false;
  RGZ.tileHoverID = "";

  var insertHtml = function(selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  document.addEventListener("DOMContentLoaded", function(event) {
    $("#book-content>.content-box-loader").css({
      "opacity": "1"
    });
    $(".content-box-content").css({
      "opacity": "0"
    });
    setTimeout(function() {
      insertHtml("#book-content>.content-box-content", `
        <div class="btn-group" data-toggle="buttons">
          <label class="btn btn-primary active" onclick="RGZ.bookSwitch(0);">
            <input type="radio" name="options" id="option1" autocomplete="off" checked>ШАЛТЕРИ
          </label>
          <label class="btn btn-primary" onclick="RGZ.bookSwitch(1);">
            <input type="radio" name="options" id="option2" autocomplete="off">КАНЦЕЛАРИЈЕ
          </label>
        </div>
        <div id="book-counters">
          <select id="counter-select" onchange="$RGZ.fetchCounterTimes();">
            <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ШАЛТЕР...</option>
            <option value="1">Шалтер 1</option>
            <option value="2">Шалтер 2</option>
            <option value="3">Шалтер 3</option>
            <option value="4">Шалтер 4</option>
          </select>
          <select id="counter-day-select" class="gone" onchange="$RGZ.bookCounterDay();">
          </select>
          <select id="counter-time-select" class="gone" onchange="$RGZ.bookCounterTime();">
          </select>
          <div id="book-counter-aux" class="aux-container gone">
            <input id="book-counter-name" placeholder="име и презиме ✱" onfocus="this.placeholder=''" onblur="this.placeholder='име и презиме ✱'">
            <input id="book-counter-id" placeholder="број личне карте ✱" onfocus="this.placeholder=''" onblur="this.placeholder='број личне карте ✱'">
            <input id="book-counter-phone" placeholder="телефон" onfocus="this.placeholder=''" onblur="this.placeholder='телефон'">
            <input id="book-counter-mail" placeholder="e-mail" onfocus="this.placeholder=''" onblur="this.placeholder='e-mail'">
            <div id="book-counter-check" onclick="RGZ.checkboxClicked(this);"><i class="fa fa-square-o"></i></div>
            <label class="checkbox-label" onclick="RGZ.checkboxClicked($('#book-counter-check'));">Потврђујем да имам потпуну и правилно попуњену документацију, као и исправно уплаћене таксе за захтев/предмет због којег заказујем термин. Такође, пристајем да наредна странка буде услужена уколико се не појавим у заказано време.</label>
            <div class="form-button">ЗАКАЖИ</div>
          </div>
        </div>
        <div id="book-offices" class="gone">
          <select id="office-select" onchange="$RGZ.fetchOfficeTimes();">
            <option disabled value="0" selected hidden>ИЗАБЕРИТЕ КАНЦЕЛАРИЈУ...</option>
            <option value="1">Канцеларија 1</option>
            <option value="2">Канцеларија 2</option>
            <option value="3">Канцеларија 3</option>
            <option value="4">Канцеларија 4</option>
          </select>
          <select id="office-day-select" class="gone" onchange="$RGZ.bookOfficeDay();">
          </select>
          <select id="office-time-select" class="gone" onchange="$RGZ.bookOfficeTime();">
          </select>
          <div id="book-office-aux" class="aux-container gone">
            <input id="book-office-name" placeholder="име и презиме ✱" onfocus="this.placeholder=''" onblur="this.placeholder='име и презиме ✱'">
            <input id="book-office-id" placeholder="број личне карте ✱" onfocus="this.placeholder=''" onblur="this.placeholder='број личне карте ✱'">
            <input id="book-office-phone" placeholder="телефон" onfocus="this.placeholder=''" onblur="this.placeholder='телефон'">
            <input id="book-office-mail" placeholder="e-mail" onfocus="this.placeholder=''" onblur="this.placeholder='e-mail'">
            <div id="book-office-check" onclick="RGZ.checkboxClicked(this);"><i class="fa fa-square-o"></i></div>
            <label class="checkbox-label" onclick="RGZ.checkboxClicked($('#book-office-check'));">Потврђујем да имам потпуну и правилно попуњену документацију, као и исправно уплаћене таксе за захтев/предмет због којег заказујем термин. Такође, пристајем да наредна странка буде услужена уколико се не појавим у заказано време.</label>
            <div class="form-button">ЗАКАЖИ</div>
          </div>
        </div>
      `);
      $(".content-box-loader").css({
        "opacity": "0"
      });
      setTimeout(function() {
        $("#book-content>.content-box-content").css({
          "opacity": "1"
        });
        $(".content-box-loader").css({
          "padding-top": "34vh"
        });
      }, 200);
    }, 3000); //this delay only simulating network response, fetch counters and offices for first dropdown in both sections
  });

  $(window).resize(function() {
    if (window.innerWidth > 991.5) {
      if ($("#foot-mobile").hasClass("clicked")) $("#foot-mobile").click();
      $(".content-box").css({
        "height": "86vh"
      });
    } else {
      $(".content-box").css({
        "height": "84vh"
      });
    }
  });

  RGZ.checkboxClicked = function(e) {
    if ($(e).find("i").hasClass("fa-square-o"))
      $(e).find("i").removeClass("fa-square-o").addClass("fa-check-square-o");
    else
      $(e).find("i").addClass("fa-square-o").removeClass("fa-check-square-o");
  };

  RGZ.bookSwitch = function(n) {
    if (n == 0) {
      setTimeout(function() {
        $("#book-offices").addClass("gone");
        $("#book-counters").removeClass("gone");
        setTimeout(function() {
          $("#book-counters").css({
            "opacity": "1"
          });
        }, 10);
      }, 400);
      $("#book-offices").css({
        "opacity": "0"
      });
    }
    if (n == 1) {
      setTimeout(function() {
        $("#book-counters").addClass("gone");
        $("#book-offices").removeClass("gone");
        setTimeout(function() {
          $("#book-offices").css({
            "opacity": "1"
          });
        }, 10);
      }, 400);
      $("#book-counters").css({
        "opacity": "0"
      });
    }
  };

  RGZ.fetchCounterTimes = function() {
    //memorise value of select?
    $("#counter-select").prop("disabled", true);
    $("#book-counter-aux, #counter-time-select, #counter-day-select").css({
      "opacity": "0"
    });
    setTimeout(function() {
      $("#book-counter-aux, #counter-time-select, #counter-day-select").addClass("gone");
      $("#book-counter-aux>input").val("");
      $("#book-counter-check>i").removeClass("fa-check-square-o").addClass("fa-square-o");
    }, 400);
    $(".content-box-loader").css({
      "opacity": "1",
      "top": "10vh"
    });
    setTimeout(function() {
      //api call
      setTimeout(function() { //this when response received
        //generate html
        var selectDayHtml = `
          <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ДАТУМ...</option>
          <option value="1">17.11.2017.</option>
          <option value="2">18.11.2017.</option>
          <option value="3">19.11.2017.</option>
        `;
        insertHtml("#counter-day-select", selectDayHtml);
        var selectTimeHtml = `
          <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ТЕРМИН...</option>
          <option disabled value="0">ПРВО ИЗАБЕРИТЕ ДАТУМ</option>
        `;
        insertHtml("#counter-time-select", selectTimeHtml);
        $("#counter-time-select, #counter-day-select").removeClass("gone");
        setTimeout(function() {
          $("#counter-time-select, #counter-day-select").css({
            "opacity": "1"
          });
        }, 10);
        $(".content-box-loader").css({
          "opacity": "0"
        });
        setTimeout(function() {
          $(".content-box-loader").css({
            "top": "0"
          });
        }, 400);
        $("#counter-select").prop("disabled", false);
      }, 2600); //this delay only simulating network response, fetch times for selected counter and insert into second dropdown
    }, 400);
  };

  RGZ.fetchOfficeTimes = function() {
    //memorise value of select?
    $("#office-select").prop("disabled", true);
    $("#book-office-aux, #office-time-select, #office-day-select").css({
      "opacity": "0"
    });
    setTimeout(function() {
      $("#book-office-aux, #office-time-select, #office-day-select").addClass("gone");
      $("#book-office-aux>input").val("");
      $("#book-office-check>i").removeClass("fa-check-square-o").addClass("fa-square-o");
    }, 400);
    $(".content-box-loader").css({
      "opacity": "1",
      "top": "10vh"
    });
    setTimeout(function() {
      //api call
      setTimeout(function() { //this when response received
        //generate html
        var selectDayHtml = `
          <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ДАТУМ...</option>
          <option value="1">17.11.2017.</option>
          <option value="2">18.11.2017.</option>
          <option value="3">19.11.2017.</option>
        `;
        insertHtml("#office-day-select", selectDayHtml);
        var selectTimeHtml = `
          <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ТЕРМИН...</option>
          <option disabled value="0">ПРВО ИЗАБЕРИТЕ ДАТУМ</option>
        `;
        insertHtml("#office-time-select", selectTimeHtml);
        $("#office-time-select, #office-day-select").removeClass("gone");
        setTimeout(function() {
          $("#office-time-select, #office-day-select").css({
            "opacity": "1"
          });
        }, 10);
        $(".content-box-loader").css({
          "opacity": "0"
        });
        setTimeout(function() {
          $(".content-box-loader").css({
            "top": "0"
          });
        }, 400);
        $("#office-select").prop("disabled", false);
      }, 2600); //this delay only simulating network response, fetch times for selected counter and insert into second dropdown
    }, 400);
  };

  RGZ.bookCounterDay = function() {
    //fetch times for selected day from json
    var selectTimeHtml = `
      <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ТЕРМИН...</option>
      <option value="1">07:00</option>
      <option value="2">08:00</option>
      <option value="3">09:00</option>
      <option value="4">10:00</option>
      <option value="5">11:00</option>
      <option value="6">12:00</option>
    `;
    insertHtml("#counter-time-select", selectTimeHtml);
  };

  RGZ.bookCounterTime = function() {
    //memorise value of select?
    $("#book-counter-aux").removeClass("gone");
    setTimeout(function() {
      $("#book-counter-aux").css({
        "opacity": "1"
      })
    }, 10);
  };

  RGZ.bookOfficeDay = function() {
    //fetch times for selected day from json
    var selectTimeHtml = `
      <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ТЕРМИН...</option>
      <option value="6">12:00</option>
      <option value="7">13:00</option>
      <option value="8">14:00</option>
      <option value="9">15:00</option>
      <option value="10">16:00</option>
      <option value="11">17:00</option>
    `;
    insertHtml("#office-time-select", selectTimeHtml);
  };

  RGZ.bookOfficeTime = function() {
    //memorise value of select?
    $("#book-office-aux").removeClass("gone");
    setTimeout(function() {
      $("#book-office-aux").css({
        "opacity": "1"
      })
    }, 10);
  };

  RGZ.fillBookContent = function() {};

  RGZ.footMouseOver = function() {
    $("#foot").css({
      "height": "29vh"
    });
    $("#foot-logo, #foot-title").removeClass("hidden").css({
      "opacity": "1"
    });
    $("#foot-text-left, #foot-text-right").removeClass("hidden").css({
      "bottom": "5.5vh",
      "opacity": 1
    });
  };

  RGZ.footMouseOut = function() {
    $("#foot").css({
      "height": "7vh"
    });
    $("#foot-logo, #foot-title").addClass("hidden").css({
      "opacity": "0"
    });
    $("#foot-text-left, #foot-text-right").addClass("hidden").css({
      "bottom": "0.5vh",
      "opacity": 0
    });
  };

  RGZ.footerMobileClick = function(e) {
    if (!$(e).hasClass("clicked")) {
      $(e).css({
        "height": "68vh",
        "max-height": "68vh"
      });
      $(".content-box").css({
        "height": "24vh"
      });
      $("#foot-mobile-logo, #foot-mobile-name").removeClass("hidden").css({
        "opacity": "1",
        "bottom": "49.5vh",
        "-webkit-transition": "opacity 0.6s ease 0.3s, bottom 0.6s ease 0.3s",
        "-moz-transition": "opacity 0.6s ease 0.3s, bottom 0.6s ease 0.3s",
        "transition": "opacity 0.6s ease 0.3s, bottom 0.6s ease 0.3s"
      });
      $("#foot-mobile-container").removeClass("hidden").css({
        "opacity": "1",
        "bottom": "3vh",
        "-webkit-transition": "opacity 0.6s ease 0.5s, bottom 0.6s ease 0.5s",
        "-moz-transition": "opacity 0.6s ease 0.5s, bottom 0.6s ease 0.5s",
        "transition": "opacity 0.6s ease 0.5s, bottom 0.6s ease 0.5s"
      });
      $(e).addClass("clicked");
    } else {
      $(e).css({
        "height": "8vh",
        "max-height": "8vh"
      });
      $(".content-box").css({
        "height": "84vh"
      });
      $("#foot-mobile-logo, #foot-mobile-name").addClass("hidden").css({
        "opacity": "0",
        "bottom": "44.5vh",
        "-webkit-transition": "opacity 0.1s ease, bottom 0.1s ease",
        "-moz-transition": "opacity 0.1s ease, bottom 0.1s ease",
        "transition": "opacity 0.1s ease, bottom 0.1s ease"
      });
      $("#foot-mobile-container").addClass("hidden").css({
        "opacity": "0",
        "bottom": "0",
        "-webkit-transition": "opacity 0.1s ease, bottom 0.1s ease",
        "-moz-transition": "opacity 0.1s ease, bottom 0.1s ease",
        "transition": "opacity 0.1s ease, bottom 0.1s ease"
      });
      $(e).removeClass("clicked");
    }
  };

  RGZ.footerMobileOutsideClick = function() {
    if ($("#foot-mobile").hasClass("clicked"))
      RGZ.footerMobileClick($("#foot-mobile"));
  };

  global.$RGZ = RGZ;
})(window);