(function(global) {
  RGZ = {};

  var bookingForbidden = false;

  var insertHtml = function(selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  var appear = function(selector, interval) {
    $(selector).removeClass("gone");
    setTimeout(function() {
      $(selector).css({
        "opacity": 1,
        "-webkit-transition": "opacity " + Number(interval) / 1000 + "s ease",
        "-moz-transition": "opacity " + Number(interval) / 1000 + "s ease",
        "transition": "opacity " + Number(interval) / 1000 + "s ease"
      });
    }, 10);
  };

  var disappear = function(selector, interval) {
    $(selector).css({
      "opacity": 0,
      "-webkit-transition": "opacity " + Number(interval) / 1000 + "s ease",
      "-moz-transition": "opacity " + Number(interval) / 1000 + "s ease",
      "transition": "opacity " + Number(interval) / 1000 + "s ease"
    });
    setTimeout(function() {
      $(selector).addClass("gone");
    }, Number(interval) + 10);
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
          <select id="counter-select" onchange="$RGZ.counterDepartmentChanged();">
            <option disabled value="0" selected hidden>ИЗАБЕРИТЕ СЛУЖБУ...</option>
            <option value="1">Ада</option>
            <option value="2">Београд</option>
            <option value="3">Сурдулица</option>
            <option value="4">Заклопача</option>
          </select>
          <div class="form-search-button-container"><div class="form-search-button" onclick="$RGZ.fetchCounterTimes();">ПРЕТРАГА</div></div>
          <select id="counter-day-select" class="gone" onchange="$RGZ.bookCounterDay();">
          </select>
          <select id="counter-time-select" class="gone" onchange="$RGZ.bookCounterTime();">
          </select>
          <div id="book-counter-aux" class="aux-container gone">
            <input id="book-counter-name" placeholder="име и презиме ✱" onfocus="this.placeholder=''" onblur="this.placeholder='име и презиме ✱'">
            <input id="book-counter-subj" placeholder="разлог заказивања ✱" onfocus="this.placeholder=''" onblur="this.placeholder='разлог заказивања ✱'">
            <input id="book-counter-phone" placeholder="телефон" onfocus="this.placeholder=''" onblur="this.placeholder='телефон'">
            <input id="book-counter-mail" placeholder="e-mail" onfocus="this.placeholder=''" onblur="this.placeholder='e-mail'">
            <div id="book-counter-check" onclick="RGZ.checkboxClicked(this);"><i class="fa fa-square-o"></i></div>
            <label class="checkbox-label" onclick="RGZ.checkboxClicked($('#book-counter-check'));">Потврђујем да имам потпуну и правилно попуњену документацију, као и исправно уплаћене таксе за захтев/упис/предмет због којег заказујем термин. У случају кашњења, доношења непотпуне/неправилне документације или неуплаћене таксе, пристајем да наредна странка буде услужена и/или да будем упућен/а на редован шалтер. Прихватам и ограничења да шалтер/служба неће извршити пријем лица уколико се захтев/предмет због којег се заказује термин не односи на то лице (осим у случају постојања одговарајућег овлашћења) и да се у време пријема не може извршити измена пријаве или неисправне документације, већ да је потребно поднети нову.</label>
            <div class="form-button">ЗАКАЖИ</div>
          </div>
        </div>
        <div id="book-offices" class="gone">
          <select id="office-select" onchange="$RGZ.officeDepartmentChanged();">
            <option disabled value="0" selected hidden>ИЗАБЕРИТЕ СЛУЖБУ...</option>
            <option value="1">Ада</option>
            <option value="2">Београд</option>
            <option value="3">Сурдулица</option>
            <option value="4">Заклопача</option>
          </select>
          <div id="subj-select">
            <div class="subj-1">
              <span class="hidden-sm-down">БР.&nbsp;ПРЕДМЕТА:</span>
              <span class="hidden-md-up">БР.&nbsp;ПР.:</span>
              &nbsp;952&nbsp;-&nbsp;02&nbsp;-&nbsp;
            </div>
            <div class="subj-input-container">
              <div class="subj-2"><input id="subj-type" type="text" maxlength="3" onkeyup="RGZ.numbersOnly(this);" onkeydown="RGZ.numbersOnly(this);"></div>
              <div class="subj-3">-</div>
              <div class="subj-4"><input id="subj-id" type="text" maxlength="17" onkeyup="RGZ.numbersOnly(this);" onkeydown="RGZ.numbersOnly(this);"></div>
              <div class="subj-5">/</div>
              <div class="subj-6"><input id="subj-year" type="text" maxlength="4" onkeyup="RGZ.numbersOnly(this);" onkeydown="RGZ.numbersOnly(this);"></div>
            </div>
          </div>
          <div class="form-search-button-container"><div class="form-search-button" onclick="$RGZ.fetchOfficeTimes();">ПРЕТРАГА</div></div>
          <select id="office-day-select" class="gone" onchange="$RGZ.bookOfficeDay();">
          </select>
          <select id="office-time-select" class="gone" onchange="$RGZ.bookOfficeTime();">
          </select>
          <div id="book-office-aux" class="aux-container gone">
            <input id="book-office-name" placeholder="име и презиме ✱" onfocus="this.placeholder=''" onblur="this.placeholder='име и презиме ✱'">
            <input id="book-office-id" placeholder="разлог заказивања ✱" onfocus="this.placeholder=''" onblur="this.placeholder='разлог заказивања ✱'">
            <input id="book-office-phone" placeholder="телефон" onfocus="this.placeholder=''" onblur="this.placeholder='телефон'">
            <input id="book-office-mail" placeholder="e-mail" onfocus="this.placeholder=''" onblur="this.placeholder='e-mail'">
            <div id="book-office-check" onclick="RGZ.checkboxClicked(this);"><i class="fa fa-square-o"></i></div>
            <label class="checkbox-label" onclick="RGZ.checkboxClicked($('#book-office-check'));">Потврђујем да имам потпуну и правилно попуњену документацију, као и исправно уплаћене таксе за захтев/упис/предмет због којег заказујем термин. У случају кашњења, доношења непотпуне/неправилне документације или неуплаћене таксе, пристајем да наредна странка буде услужена и/или да будем упућен/а на редован шалтер. Прихватам и ограничења да шалтер/служба неће извршити пријем лица уколико се захтев/предмет због којег се заказује термин не односи на то лице (осим у случају постојања одговарајућег овлашћења) и да се у време пријема не може извршити измена пријаве или неисправне документације, већ да је потребно поднети нову.</label>
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
    if (!$("#book-offices").hasClass("gone"))
      $(".subj-input-container").width($("#subj-select").innerWidth() - $(".subj-1").innerWidth());
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
      }, 500);
      $("#book-offices").css({
        "opacity": "0"
      });
    }
    if (n == 1) {
      setTimeout(function() {
        $("#book-counters").addClass("gone");
        $("#book-offices").removeClass("gone");
        $(".subj-input-container").width($("#subj-select").innerWidth() - $(".subj-1").innerWidth());
        setTimeout(function() {
          $("#book-offices").css({
            "opacity": "1"
          });
        }, 10);
      }, 500);
      $("#book-counters").css({
        "opacity": "0"
      });
    }
  };

  RGZ.counterDepartmentChanged = function() {
    bookingForbidden = true;
    $("#counter-day-select, #counter-time-select").prop("disabled", true);
    setTimeout(function() {
      bookingForbidden = false;
      $("#counter-day-select, #counter-time-select").prop("disabled", false);
    }, 1000);
    setTimeout(function() {
      disappear($("#counter-day-select, #counter-time-select, #book-counter-aux"), 500);
    }, 500);
    $(".content-box-content").animate({
      scrollTop: 0
    }, 1000);
  }

  RGZ.officeDepartmentChanged = function() {
    bookingForbidden = true;
    $("#office-day-select, #office-time-select").prop("disabled", true);
    setTimeout(function() {
      bookingForbidden = false;
      $("#office-day-select, #office-time-select").prop("disabled", false);
    }, 1000);
    setTimeout(function() {
      disappear($("#office-day-select, #office-time-select, #book-office-aux"), 500);
    }, 500);
    $(".content-box-content").animate({
      scrollTop: 0
    }, 1000);
  }

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
    }, 500);
    $(".content-box-loader").css({
      "opacity": "1",
      "padding-top": "45vh"
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
        $("#counter-select").prop("disabled", false);
      }, 2600); //this delay only simulating network response, fetch times for selected counter and insert into second dropdown
    }, 500);
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
    }, 500);
    $(".content-box-loader").css({
      "opacity": "1",
      "padding-top": "56vh"
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
        $("#office-select").prop("disabled", false);
      }, 2600); //this delay only simulating network response, fetch times for selected counter and insert into second dropdown
    }, 500);
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
    $(".content-box-content").animate({
      scrollTop: $("#book-counter-aux").offset().top - $(".btn-group").offset().top
    }, 1500);
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
    $(".content-box-content").animate({
      scrollTop: $("#book-office-aux").offset().top - $(".btn-group").offset().top
    }, 1500);
    setTimeout(function() {
      $("#book-office-aux").css({
        "opacity": "1"
      })
    }, 10);
  };

  RGZ.numbersOnly = function(e) {
    $(e).val($(e).val().replace(/\D/g, ''));
    if ($(e).attr("id") == "subj-type")
      RGZ.officeDepartmentChanged();
  };

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