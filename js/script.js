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
    if (history.state != null) {
      if (history.state.state != null) {
        switch (history.state.state) {
          case 0:
            RGZ.navi(0);
            break;
          case 1:
            RGZ.navi(1);
            break;
          case 2:
            RGZ.navi(2);
            break;
          case 3:
            RGZ.navi(3);
            break;
          default:
            break;
        }
        if (history.state.state > 0 && window.innerWidth > 990.5) {
          $("#navi-landing").css({
            "opacity": "0"
          });
          $("#navi-menu").removeClass("gone");
          setTimeout(function() {
            $("#navi-menu").css({
              "opacity": "1"
            });
          }, 600);
          $("#navi-menu div span").removeClass("active");
          $("#navi-" + ((history.state.state == 1) ? "book" : ((history.state.state == 2) ? "stat" : "info")) + " span").addClass("active");
        }
      }
    } else {
      history.replaceState({
        state: 0
      }, null, null);
      RGZ.loadPage(0);
      RGZ.footMouseOver();
      setTimeout(RGZ.footMouseOut, 2500);
    }
  });

  window.onpopstate = function(event) {
    if (event.state != null) {
      if (event.state.state != null) {
        switch (event.state.state) {
          case 0:
            RGZ.navi(0);
            break;
          case 1:
            RGZ.navi(1);
            break;
          case 2:
            RGZ.navi(2);
            break;
          case 3:
            RGZ.navi(3);
            break;
          default:
            break;
        }
        if (event.state.state > 0 && window.innerWidth > 990.5) {
          $("#navi-landing").css({
            "opacity": "0"
          });
          $("#navi-menu").removeClass("gone");
          setTimeout(function() {
            $("#navi-menu").css({
              "opacity": "1"
            });
          }, 600);
          $("#navi-menu div span").removeClass("active");
          $("#navi-" + ((event.state.state == 1) ? "book" : ((event.state.state == 2) ? "stat" : "info")) + " span").addClass("active");
        }
      }
    }
  };

  RGZ.mobileMenuTouchOutside = function() {
    if (!$("#navi-button").hasClass("collapsed"))
      $("#navi-button").click();
  };

  var mouseoverLock = 0;
  RGZ.tileMouseOver = function(e) {
    RGZ.tileHoverID = $(e).attr("id");
    if (mouseoverLock != 0) return;
    mouseoverLock = 1;
    $(".tile").removeClass("col-4").addClass("col-3").css({
      "max-width": "25%"
    });
    $(e).removeClass("col-3").addClass("col-6").css({
      "background-color": "#E5EEC1",
      "max-width": "50%"
    });
    $(e).find(".tile-title").css({
      "top": "-15vh",
      "color": "#333",
      "font-size": "4vh"
    });
    $(e).find(".tile-line").removeClass("hidden").css({
      "width": "60%"
    });
    $(e).find(".tile-text").removeClass("hidden").css({
      "top": "40vh",
      "opacity": "1"
    });
    $(e).find(".tile-button").removeClass("hidden").css({
      "top": "54vh",
      "opacity": "1"
    });
    setTimeout(function() {
      mouseoverLock = 0;
      if (RGZ.tileHoverID != $(e).attr("id")) {
        RGZ.tileMouseOut();
        RGZ.tileMouseOver($("#" + RGZ.tileHoverID));
      }
    }, 600);
  };

  RGZ.tileMobileClick = function(e) {
    if (RGZ.mobileButtonClicked) {
      RGZ.mobileButtonClicked = false;
      return;
    }
    if (!$(e).hasClass("clicked")) {
      $(".tile-mobile, .foot-mobile").css({
        "height": "8vh",
        "max-height": "8vh"
      });
      $(".tile-mobile>.tile-mobile-title").css({
        "top": "0",
        "color": "#F4F8E6"
      });
      $("#book-mobile").css({
        "background-color": "#589662"
      });
      $("#stat-mobile").css({
        "background-color": "#3EACA8"
      });
      $("#info-mobile").css({
        "background-color": "#547A82"
      });

      $(".tile-mobile-line, .tile-mobile-text, .tile-mobile-button").addClass("hidden");
      $(".tile-mobile-line").css({
        "width": "0"
      });
      $(".tile-mobile-text").css({
        "bottom": "15vh",
        "opacity": "0"
      });
      $(".tile-mobile-button").css({
        "bottom": "1vh",
        "opacity": "0"
      });

      $(e).css({
        "height": "68vh",
        "max-height": "68vh"
      });

      $(e).find(".tile-mobile-title").css({
        "top": "12vh",
        "color": "#333",
        "font-size": "3.3vh"
      });
      $(e).find(".tile-mobile-line").removeClass("hidden").css({
        "width": "90%"
      });
      $(e).find(".tile-mobile-text").removeClass("hidden").css({
        "bottom": "20vh",
        "opacity": "1"
      });
      $(e).find(".tile-mobile-button").removeClass("hidden").css({
        "bottom": "6vh",
        "opacity": "1"
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
      if (!$(e).hasClass("foot-mobile"))
        $(e).css({
          "background-color": "#E5EEC1"
        });
      else {
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
      }

      $(".tile-mobile, .foot-mobile").removeClass("clicked");
      $(e).addClass("clicked");
    } else {
      $(".foot-mobile").css({
        "height": "8vh",
        "max-height": "8vh"
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
      $(".tile-mobile").css({
        "height": "28vh",
        "max-height": "28vh"
      });
      $("#book-mobile").css({
        "background-color": "#589662"
      });
      $("#stat-mobile").css({
        "background-color": "#3EACA8"
      });
      $("#info-mobile").css({
        "background-color": "#547A82"
      });

      $(".tile-mobile-line, .tile-mobile-text, .tile-mobile-button").addClass("hidden");
      $(".tile-mobile-line").css({
        "width": "0"
      });
      $(".tile-mobile-text").css({
        "bottom": "15vh",
        "opacity": "0"
      });
      $(".tile-mobile-button").css({
        "bottom": "1vh",
        "opacity": "0"
      });

      $(".tile-mobile-title").css({
        "top": "11vh",
        "font-size": "3vh",
        "color": "#F4F8E6"
      });
      $(".tile-mobile, .foot-mobile").removeClass("clicked");
    }
  };

  var mouseoutLock = 0;
  RGZ.tileMouseOut = function() {
    if (mouseoutLock != 0) return;
    mouseoutLock = 1;
    $(".tile").removeClass("col-3 col-6").addClass("col-4").css({
      "max-width": "33.333333%"
    });
    $(".tile-title").css({
      "top": "0",
      "color": "#F4F8E6",
      "font-size": "3vh"
    });
    $(".tile-line").addClass("hidden").css({
      "width": "0"
    });
    $(".tile-text").addClass("hidden").css({
      "top": "45vh",
      "opacity": "0"
    });
    $(".tile-button").addClass("hidden").css({
      "top": "59vh",
      "opacity": "0"
    });
    $("#book").css({
      "background-color": "#589662"
    });
    $("#stat").css({
      "background-color": "#3EACA8"
    });
    $("#info").css({
      "background-color": "#547A82"
    });
    setTimeout(function() {
      mouseoutLock = 0;
    }, 600);
  };

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
        $("#office-time-select").removeClass("gone");
        setTimeout(function() {
          $("#office-time-select").css({
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

  RGZ.fillBookContent = function() {
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
      }, 200);
    }, 3000); //this delay only simulating network response, fetch counters and offices for first dropdown in both sections
  };

  RGZ.fillStatContent = function() {
    $("#stat-content>.content-box-loader").css({
      "opacity": "1"
    });
    $(".content-box-content").css({
      "opacity": "0"
    });
    setTimeout(function() {
      insertHtml("#stat-content>.content-box-content", `
        <div class="message-overlay">
          <div class="message-container message-error">
            <i class="message-icon fa fa-ban"></i>
            <div class="message-ct-container">
              <div class="message-code">404</div>
              <div class="message-text">Тражена функционалност није тренутно доступна.</div>
            </div>
          </div>
        </div>
      `);
      $(".content-box-loader").css({
        "opacity": "0"
      });
      setTimeout(function() {
        $("#stat-content>.content-box-content").css({
          "opacity": "1"
        });
      }, 200);
    }, 3000); //this delay only simulating network response
  };

  RGZ.infoSwitch = function(n) {
    if (n == 0) {
      setTimeout(function() {
        $("#accordion").addClass("gone");
        $("#documentation").removeClass("gone");
        setTimeout(function() {
          $("#documentation").css({
            "opacity": "1"
          });
        }, 10);
      }, 400);
      $("#accordion").css({
        "opacity": "0"
      });
    }
    if (n == 1) {
      setTimeout(function() {
        $("#documentation").addClass("gone");
        $("#accordion").removeClass("gone");
        setTimeout(function() {
          $("#accordion").css({
            "opacity": "1"
          });
        }, 10);
      }, 400);
      $("#documentation").css({
        "opacity": "0"
      });
    }
  };

  RGZ.infoDocs = function() {
    $("#docs-select").prop("disabled", true);
    $("#docsaux").css({
      "opacity": "0"
    });
    setTimeout(function() {
      $("#docsaux").addClass("gone");
    }, 400);
    $(".content-box-loader").css({
      "opacity": "1",
      "top": "10vh"
    });
    //api call
    setTimeout(function() { //this when response received
      //insert response or render first
      insertHtml("#docsaux", `
        <div class="docsaux-item">
          <a class="docsaux-item-download" href="https://www.google.rs/" target="_blank">
            <i class="docsaux-item-download-icon fa fa-file-text"></i>
            <div class="docsaux-item-download-text">ПРЕУЗМИТЕ<br>ОБРАЗАЦ</div>
          </a>
          <div class="docsaux-item-title">
            ОБРАЗАЦ 1
          </div>
          <div class="docsaux-item-text">
            Опис обрасца, обавезна поља, посебне напомене, лорем ипсум долор сит амет, цонсецтетур адиписицинг елит, сед до еиусмод темпор инцидидунт ут лаборе ет долоре магна аликва. Ут еним ад миним вениам, квис ноструд еxерцитатион улламцо лаборис ниси ут аликвип екс еа цоммодо цонсекват.
          </div>
        </div>
        <div class="docsaux-item">
          <a class="docsaux-item-download" href="https://www.google.rs/" target="_blank">
            <i class="docsaux-item-download-icon fa fa-file-text"></i>
            <div class="docsaux-item-download-text">ПРЕУЗМИТЕ<br>ОБРАЗАЦ</div>
          </a>
          <div class="docsaux-item-title">
            ОБРАЗАЦ 2
          </div>
          <div class="docsaux-item-text">
            Опис обрасца, обавезна поља, посебне напомене, лорем ипсум долор сит амет, цонсецтетур адиписицинг елит, сед до еиусмод темпор инцидидунт ут лаборе ет долоре магна аликва. Ут еним ад миним вениам, квис ноструд еxерцитатион улламцо лаборис ниси ут аликвип екс еа цоммодо цонсекват.
          </div>
        </div>
        <div class="docsaux-item">
          <div class="docsaux-item-download">
            <i class="docsaux-item-download-icon fa fa-gavel"></i>
          </div>
          <div class="docsaux-item-title">
            СУДСКО РЕШЕЊЕ
          </div>
          <div class="docsaux-item-text">
            Морате имати решење X. Решење не сме бити старије од 6 месеци. Лорем ипсум долор сит амет, цонсецтетур адиписицинг елит.
          </div>
        </div>
        <div class="docsaux-item">
          <div class="docsaux-item-download">
            <i class="docsaux-item-download-icon fa fa-book"></i>
          </div>
          <div class="docsaux-item-title">
            ПРЕДМЕТНА ДОКУМЕНТАЦИЈА
          </div>
          <div class="docsaux-item-text">
            Морате имати одобрења X, Y и Z. Предметна документација мора бити претходно комплетирана у поступку W. Лорем ипсум долор сит амет, цонсецтетур адиписицинг елит.
          </div>
        </div>
        <div class="docsaux-item">
          <div class="docsaux-item-download">
            <i class="docsaux-item-download-icon fa fa-id-card"></i>
          </div>
          <div class="docsaux-item-title">
            КОПИЈА ЛИЧНЕ КАРТЕ<br>(ОРИГИНАЛ НА УВИД)
          </div>
          <div class="docsaux-item-text">
            Проверите да Вам лична карта није истекла. Копија не треба да буде оверена. Лорем ипсум долор сит амет, цонсецтетур адиписицинг елит, сед до еиусмод темпор инцидидунт ут лаборе ет долоре магна аликва.
          </div>
        </div>
        <div class="docsaux-item">
          <a class="docsaux-item-download" href="https://www.google.rs/" target="_blank">
            <i class="docsaux-item-download-icon fa fa-money"></i>
            <div class="docsaux-item-download-text">ПРИМЕР<br>УПЛАТНИЦЕ</div>
          </a>
          <div class="docsaux-item-title">
            300&nbsp;РСД&nbsp;<span class="docsaux-item-title-asterisk">✱</span>
          </div>
          <div class="docsaux-item-text">
            Прималац, жиро-рачун, позив на број, лорем ипсум долор сит амет, цонсецтетур адиписицинг елит, сед до еиусмод темпор инцидидунт ут лаборе ет долоре магна аликва.
            <div class="docsaux-item-text-asterisk">
              <div class="docsaux-item-text-asterisk-inner">✱</div>Напомена да се таксе могу разликовати од наведених услед специјалних случајева [овде по уплати]. Лорем ипсум долор сит амет, цонсецтетур адиписицинг елит, сед до еиусмод темпор инцидидунт ут лаборе ет долоре магна аликва.
            </div>
          </div>
        </div>
        <div class="docsaux-item">
          <div class=docsaux-item-text>
            <div class=docsaux-item-text-asterisk>
              <div class="docsaux-item-text-asterisk-inner">✱</div>Напомена да се таксе могу разликовати од наведених услед специјалних случајева [овде по документацији]. Лорем ипсум долор сит амет, цонсецтетур адиписицинг елит, сед до еиусмод темпор инцидидунт ут лаборе ет долоре магна аликва.
            </div>
          </div>
        </div>
      `);
      $("#docsaux").removeClass("gone");
      setTimeout(function() {
        $("#docsaux").css({
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
      $("#docs-select").prop("disabled", false);
    }, 3000); //this delay only simulating network response
  };

  RGZ.fillInfoContent = function() {
    $("#info-content>.content-box-loader").css({
      "opacity": "1"
    });
    $(".content-box-content").css({
      "opacity": "0"
    });
    setTimeout(function() {
      insertHtml("#info-content>.content-box-content", `
        <div class="btn-group" data-toggle="buttons">
          <label class="btn btn-primary active" onclick="RGZ.infoSwitch(0);">
            <input type="radio" name="options" id="option1" autocomplete="off" checked>ДОКУМЕНТА
          </label>
          <label class="btn btn-primary" onclick="RGZ.infoSwitch(1);">
            <input type="radio" name="options" id="option2" autocomplete="off">ПИТАЊА
          </label>
        </div>
        <div id="documentation">
          <select id="docs-select" onchange="$RGZ.infoDocs();">
            <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ДОКУМЕНТАЦИЈУ...</option>
            <option value="1">Документ 1</option>
            <option value="2">Документ 2</option>
            <option value="3">Захтев 1</option>
            <option value="4">Захтев 2</option>
          </select>
          <div id="docsaux" class="aux-container gone">
          </div>
        </div>
        <div id="accordion" role="tablist" aria-multiselectable="true" class="gone">
          <div class="card">
            <div class="card-header" role="tab" id="headingOne">
              <div class="faq-link collapsed" data-toggle="collapse" data-parent="#accordion" aria-expanded="false" aria-controls="collapseOne" data-target="#collapseOne" onclick="$RGZ.faqClicked(this);" onmouseover="$RGZ.faqMouseOver(this);" onmouseout="$RGZ.faqMouseOut(this);">
                Како ће у својинским евиденцијама бити уписано право закупа грађевинског земљишта када је такво право конституисано у поступку комплетирања грађевинских парцела, па се исто лице/инвеститор на једном делу парцеле води као корисник градског грађевинског земљишта, а на другом делу као закупац? Како ће се формирати грађевинска парцела у таквом случају?
              </div>
            </div>
            <div id="collapseOne" class="collapse" role="tabpanel" aria-labelledby="headingOne">
              <div class="card-block">
                Одговор на ово питање изискује прибављање стручног мишљења надлежног Министарства око примене Закона о планирању и изградњи. Одговор ће бити достављен накнадно.
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header" role="tab" id="headingTwo">
              <div class="faq-link collapsed" data-toggle="collapse" data-parent="#accordion" aria-expanded="false" aria-controls="collapseTwo" data-target="#collapseTwo" onclick="$RGZ.faqClicked(this);" onmouseover="$RGZ.faqMouseOver(this);" onmouseout="$RGZ.faqMouseOut(this);">
                Зашто се не спроводе парцелације земљишта када се грађевинска парцела образује од катастарских парцела два или више различитих корисника? Да ли је могуће спровести такву парцелацију и утврдити идеалне сукорисничке делове на грађевинској парцели? На основу чега би такви сукорисници могли остварити право на заједничку изградњу на парцели?
              </div>
            </div>
            <div id="collapseTwo" class="collapse" role="tabpanel" aria-labelledby="headingTwo">
              <div class="card-block">
                Грађевинска парцела се може обележити на терену и спровести на плановима и у операту, не мењајући упис досадашњих корисника. Формирање грађевинске парцеле се може урадити након доношења акта надлежног органа о решавању имовинско-правних односа.
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header" role="tab" id="headingThree">
              <div class="faq-link collapsed" data-toggle="collapse" data-parent="#accordion" aria-expanded="false" aria-controls="collapseThree" data-target="#collapseThree" onclick="$RGZ.faqClicked(this);" onmouseover="$RGZ.faqMouseOver(this);" onmouseout="$RGZ.faqMouseOut(this);">
                Да ли је РГЗ у могућности да у листу непокретности и другој својој документацији упише правни стварни облик својине на непокретностима?
              </div>
            </div>
            <div id="collapseThree" class="collapse" role="tabpanel" aria-labelledby="headingThree">
              <div class="card-block">
                У катастар непокретности може да се упише сваки облик својине.
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header" role="tab" id="headingFour">
              <div class="faq-link collapsed" data-toggle="collapse" data-parent="#accordion" aria-expanded="false" aria-controls="collapseFour" data-target="#collapseFour" onclick="$RGZ.faqClicked(this);" onmouseover="$RGZ.faqMouseOver(this);" onmouseout="$RGZ.faqMouseOut(this);">
                Какве су могућности коришћења ортофото планова за одржавање премера и прво (иницијално) укњижење објеката који до сада нису евидентирани на катастарским плановима и нису укњижени?
              </div>
            </div>
            <div id="collapseFour" class="collapse" role="tabpanel" aria-labelledby="headingFour">
              <div class="card-block">
                Према постојећим прописима, подаци садржани на ортофото плановима се не могу користити за одржавање премера и укњижбу објеката који до сада нису евидентирани на катастарским плановима.
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header" role="tab" id="headingFive">
              <div class="faq-link collapsed" data-toggle="collapse" data-parent="#accordion" aria-expanded="false" aria-controls="collapseFive" data-target="#collapseFive" onclick="$RGZ.faqClicked(this);" onmouseover="$RGZ.faqMouseOver(this);" onmouseout="$RGZ.faqMouseOut(this);">
                На који начин ће се доказивати право својине и коришћења на земљишту где су изграђени објекти без грађевинске дозволе?
              </div>
            </div>
            <div id="collapseFive" class="collapse" role="tabpanel" aria-labelledby="headingFive">
              <div class="card-block">
                Право својине и коришћења на земљишту доказује се пред органом надлежним за утврђивање тих права. У катастру непокретности се врши упис већ утврђених права.
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header" role="tab" id="headingSix">
              <div class="faq-link collapsed" data-toggle="collapse" data-parent="#accordion" aria-expanded="false" aria-controls="collapseSix" data-target="#collapseSix" onclick="$RGZ.faqClicked(this);" onmouseover="$RGZ.faqMouseOver(this);" onmouseout="$RGZ.faqMouseOut(this);">
                Шта је основ за израду катастра непокретности у катастарским општинама (градско грађевинско земљиште) где је извршена обнова премера која није потврђена?
              </div>
            </div>
            <div id="collapseSix" class="collapse" role="tabpanel" aria-labelledby="headingSix">
              <div class="card-block">
                Како одговор на ово питање захтева дубље анализе премера (како старог тако и новог), степена ажурности старог премера и квалитета одржавања и време извршења обнове премера, прописано је да се у оваквим случајевима ради пројектно решење.
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header" role="tab" id="headingSeven">
              <div class="faq-link collapsed" data-toggle="collapse" data-parent="#accordion" aria-expanded="false" aria-controls="collapseSeven" data-target="#collapseSeven" onclick="$RGZ.faqClicked(this);" onmouseover="$RGZ.faqMouseOver(this);" onmouseout="$RGZ.faqMouseOut(this);">
                Да ли је дозвољено штампање извода из листа непокретности, и то само <i>В2</i> листа без <i>А</i>, <i>Б</i> и <i>В1</i> листа?
              </div>
            </div>
            <div id="collapseSeven" class="collapse" role="tabpanel" aria-labelledby="headingSeven">
              <div class="card-block">
                Дозвољено је издавање само извода из листа непокретности, односно само извода из <i>В2</i> листа непокретности са насловном страном.
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header" role="tab" id="headingEight">
              <div class="faq-link collapsed" data-toggle="collapse" data-parent="#accordion" aria-expanded="false" aria-controls="collapseEight" data-target="#collapseEight" onclick="$RGZ.faqClicked(this);" onmouseover="$RGZ.faqMouseOver(this);" onmouseout="$RGZ.faqMouseOut(this);">
                Да ли је у поступку одржавања катастра непокретности дозвољено уписивање права својине на објекту изграђеном на подручју градског грађевинског земљишта, за који је издата грађевинска дозвола?
              </div>
            </div>
            <div id="collapseEight" class="collapse" role="tabpanel" aria-labelledby="headingEight">
              <div class="card-block">
                 У поступку одржавања катастра непокретности, за упис права својине на објекту изграђеном на подручју градског грађевинског земљишта неопходна је и употребна дозвола. По основу грађевинске дозволе може се уписати само државина на објекту са забелешком да за објекат није издата употребна дозвола, при чему се као датум уписа забелешке уписује датум правоснажности решења којим се дозвољава упис држаоца објекта.
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header" role="tab" id="headingNine">
              <div class="faq-link collapsed" data-toggle="collapse" data-parent="#accordion" aria-expanded="false" aria-controls="collapseNine" data-target="#collapseNine" onclick="$RGZ.faqClicked(this);" onmouseover="$RGZ.faqMouseOver(this);" onmouseout="$RGZ.faqMouseOut(this);">
                Због укњижбе предузећа, катастарска општина (КО) је подељена и налази се у статусу <i>катастар непокретности</i> и <i>катастар земљишта</i>. Да ли промене у делу КО која је у статусу <i>катастар непокретности</i> треба евидентирати у списку промена за део КО која је у статусу <i>катастар земљишта</i>?
              </div>
            </div>
            <div id="collapseNine" class="collapse" role="tabpanel" aria-labelledby="headingNine">
              <div class="card-block">
                Води се посебан списак промена за део КО која је у статусу <i>катастар непокретности</i>.
              </div>
            </div>
          </div>

        </div>
      `);
      $(".content-box-loader").css({
        "opacity": "0"
      });
      setTimeout(function() {
        $("#info-content>.content-box-content").css({
          "opacity": "1"
        });
      }, 200);
    }, 3000); //this delay only simulating network response
  };

  RGZ.loadPage = function(n) {
    if (n < 0 || n > 3) return;
    switch (n) {
      case 0:
        $(".content-box").css({
          "opacity": "0"
        });
        setTimeout(function() {
          $(".content-box").addClass("gone");
          $(".tile").addClass("col-4").removeClass("col-3 col-6 col-12").css({
            "max-width": "33.333333%"
          });
          $(".tile-mobile").removeClass("clicked").css({
            "height": "28vh",
            "max-height": "28vh"
          });
        }, 400);
        break;
      case 1:
        if (RGZ.nav == 1) break;
        if (RGZ.nav == 0)
          setTimeout(function() {
            $("#book-content").removeClass("gone");
            setTimeout(function() {
              $("#book-content").css({
                "opacity": "1"
              });
            }, 5);
          }, 1000);
        else {
          $(".content-box").css({
            "opacity": "0"
          });
          $("#book-content").removeClass("gone");
          setTimeout(function() {
            $("#book-content").css({
              "opacity": "1"
            });
          }, 5);
          setTimeout(function() {
            $("#stat-content, #info-content").addClass("gone");
          }, 400);
        }
        RGZ.fillBookContent();
        break;
      case 2:
        if (RGZ.nav == 2) break;
        if (RGZ.nav == 0)
          setTimeout(function() {
            $("#stat-content").removeClass("gone");
            setTimeout(function() {
              $("#stat-content").css({
                "opacity": "1"
              });
            }, 5);
          }, 1000);
        else {
          $(".content-box").css({
            "opacity": "0"
          });
          $("#stat-content").removeClass("gone");
          setTimeout(function() {
            $("#stat-content").css({
              "opacity": "1"
            });
          }, 5);
          setTimeout(function() {
            $("#book-content, #info-content").addClass("gone");
          }, 400);
        }
        RGZ.fillStatContent();
        break;
      case 3:
        if (RGZ.nav == 3) break;
        if (RGZ.nav == 0)
          setTimeout(function() {
            $("#info-content").removeClass("gone");
            setTimeout(function() {
              $("#info-content").css({
                "opacity": "1"
              });
            }, 5);
          }, 1000);
        else {
          $(".content-box").css({
            "opacity": "0"
          });
          $("#info-content").removeClass("gone");
          setTimeout(function() {
            $("#info-content").css({
              "opacity": "1"
            });
          }, 5);
          setTimeout(function() {
            $("#stat-content, #book-content").addClass("gone");
          }, 400);
        }
        RGZ.fillInfoContent();
        break;
      default:
        break;
    }
    RGZ.nav = n;
  };

  $(window).resize(function() {
    if (window.innerWidth > 991.5 && RGZ.nav != 0) {
      $("#navi-landing").css({
        "opacity": "0"
      });
      setTimeout(function() {
        $("#navi-menu").css({
          "opacity": "1"
        });
      }, 600);
      $("#navi-button").css({
        "opacity": "0"
      });
      setTimeout(function() {
        $("#navi-button").addClass("hidden");
      }, 400);
    } else if (window.innerWidth < 991.5 && RGZ.nav != 0) {
      $("#navi-menu").css({
        "opacity": "0"
      });
      setTimeout(function() {
        $("#navi-landing").css({
          "opacity": "1"
        });
      }, 600);
      $("#navi-button").removeClass("hidden");
      setTimeout(function() {
        $("#navi-button").css({
          "opacity": "1"
        });
      }, 600);
    }
  });

  RGZ.navi = function(n) {
    if (n < 0 || n > 3) return;
    else if (n == 0) {
      $("#navi-menu").css({
        "opacity": "0"
      });
      setTimeout(function() {
        $("#navi-landing").css({
          "opacity": "1"
        });
        $("#navi-menu").addClass("gone");
      }, 600);
      $("#navi-button").css({
        "opacity": "0"
      });
      setTimeout(function() {
        $("#navi-button").addClass("hidden");
      }, 400);
      $(".tile-img, .tile-mobile-img").removeClass("gone");
      $("#foot-mobile").css({
        "height": "8vh",
        "max-height": "8vh"
      });
      setTimeout(function() {
        $(".tile>div, .tile-mobile>div").removeClass("gone");
        $(".tile-title").css({
          "opacity": "1",
          "top": "0",
          "color": "#F4F8E6",
          "font-size": "3vh",
          "letter-spacing": "2px",
          "-webkit-transition": "top 0.4s ease, font-size 0.4s ease, color 0.4s ease",
          "-moz-transition": "top 0.4s ease, font-size 0.4s ease, color 0.4s ease",
          "transition": "top 0.4s ease, font-size 0.4s ease, color 0.4s ease"
        });
        $(".tile-mobile-title").css({
          "opacity": "1",
          "top": "11vh",
          "color": "#F4F8E6",
          "font-size": "3vh",
          "letter-spacing": "2px",
          "-webkit-transition": "top 0.4s ease, font-size 0.4s ease, color 0.4s ease",
          "-moz-transition": "top 0.4s ease, font-size 0.4s ease, color 0.4s ease",
          "transition": "top 0.4s ease, font-size 0.4s ease, color 0.4s ease"
        });
        $(".tile-line").css({
          "opacity": "1",
          "width": "0",
          "-webkit-transition": "width 0.5s ease 0.4s",
          "-moz-transition": "width 0.5s ease 0.4s",
          "transition": "width 0.5s ease 0.4s"
        });
        $(".tile-mobile-line").css({
          "opacity": "1",
          "width": "0",
          "-webkit-transition": "width 0.8s ease 0.4s",
          "-moz-transition": "width 0.8s ease 0.4s",
          "transition": "width 0.8s ease 0.4s"
        });
        $(".tile-text").css({
          "top": "45vh",
          "-webkit-transition": "top 0.6s ease 0.2s, opacity 0.6s ease 0.2s",
          "-moz-transition": "top 0.6s ease 0.2s, opacity 0.6s ease 0.2s",
          "transition": "top 0.6s ease 0.2s, opacity 0.6s ease 0.2s"
        });
        $(".tile-mobile-text").css({
          "bottom": "15vh",
          "-webkit-transition": "bottom 0.6s ease 0.2s, opacity 0.6s ease 0.2s",
          "-moz-transition": "bottom 0.6s ease 0.2s, opacity 0.6s ease 0.2s",
          "transition": "bottom 0.6s ease 0.2s, opacity 0.6s ease 0.2s"
        });
        $(".tile-button").css({
          "top": "59vh",
          "-webkit-transition": "top 0.6s ease 0.4s, opacity 0.6s ease 0.4s, background-color 0.4s ease, color 0.4s ease",
          "-moz-transition": "top 0.6s ease 0.4s, opacity 0.6s ease 0.4s, background-color 0.4s ease, color 0.4s ease",
          "transition": "top 0.6s ease 0.4s, opacity 0.6s ease 0.4s, background-color 0.4s ease, color 0.4s ease"
        });
        $(".tile-mobile-button").css({
          "bottom": "1vh",
          "-webkit-transition": "bottom 0.6s ease 0.4s, opacity 0.6s ease 0.4s, background-color 0.4s ease, color 0.4s ease",
          "-moz-transition": "bottom 0.6s ease 0.4s, opacity 0.6s ease 0.4s, background-color 0.4s ease, color 0.4s ease",
          "transition": "bottom 0.6s ease 0.4s, opacity 0.6s ease 0.4s, background-color 0.4s ease, color 0.4s ease"
        });
        $("#book, #book-mobile").css({
          "background-color": "#589662"
        });
        $("#stat, #stat-mobile").css({
          "background-color": "#3EACA8"
        });
        $("#info, #info-mobile").css({
          "background-color": "#547A82"
        });
        $("#foot-mobile-title").removeClass("gone").css({
          "opacity": "1"
        });
        $(".tile").attr("onmouseenter", "$RGZ.tileMouseOver(this);");
        $(".tile").attr("onmouseleave", "$RGZ.tileMouseOut();");
      }, 400);
      RGZ.loadPage(0);
      RGZ.mobileButtonClicked = false;
    } else {
      if (window.innerWidth < 990.5) {
        if ($("#foot-mobile").hasClass("clicked"))
          $("#foot-mobile").click();
        RGZ.mobileButtonClicked = true;
        $("#navi-button").removeClass("hidden").css({
          "opacity": "1"
        });
      }
      if (RGZ.nav == 0) {
        if (window.innerWidth > 990.5)
          $("#navi-landing").css({
            "opacity": "0"
          });
        $(".tile-title, .tile-line, .tile-text, .tile-button").css({
          "opacity": "0",
          "-webkit-transition": "opacity 0.4s ease",
          "-moz-transition": "opacity 0.4s ease",
          "transition": "opacity 0.4s ease"
        });
        $(".tile-mobile-title, .tile-mobile-line, .tile-mobile-text, .tile-mobile-button").css({
          "opacity": "0",
          "-webkit-transition": "opacity 0.4s ease",
          "-moz-transition": "opacity 0.4s ease",
          "transition": "opacity 0.4s ease"
        });
        setTimeout(function() {
          $(".tile-mobile-line, .tile-mobile-text, .tile-mobile-button").addClass("hidden");
        }, 400);
        $("#foot-mobile-title").css({
          "opacity": "0"
        });
        $(".tile").removeAttr("onmouseenter");
        $(".tile").removeAttr("onmouseleave");
        $("#navi-menu").removeClass("gone");
        setTimeout(function() {
          $("#navi-menu").css({
            "opacity": "1"
          });
        }, 600);
        setTimeout(function() {
          $(".tile-img, .tile-mobile-img").addClass("gone");
        }, 1400);
      }
      $("#navi-menu div span").removeClass("active");
      $("#navi-" + ((n == 1) ? "book" : ((n == 2) ? "stat" : "info")) + " span").addClass("active");
      RGZ.loadPage(n);
      setTimeout(function() {
        $(".tile").css({
          "max-width": "0"
        });
        $("#" + ((n == 1) ? "book" : ((n == 2) ? "stat" : "info"))).removeClass("col-6").addClass("col-12").css({
          "max-width": "100%",
          "background-color": "#E5EEC1"
        });
        $(".tile-title, .tile-line, .tile-text, .tile-button").addClass("gone");

        $(".tile-mobile, #foot-mobile").css({
          "height": "0",
          "max-height": "0"
        });
        $("#" + ((n == 1) ? "book" : ((n == 2) ? "stat" : "info")) + "-mobile").removeClass("clicked").css({
          "height": "100%",
          "max-height": "100%",
          "background-color": "#E5EEC1"
        });
        $(".tile-mobile-title, .tile-mobile-line, .tile-mobile-text, .tile-mobile-button").addClass("gone");
        $("#foot-mobile-title").addClass("gone");
      }, 400);
    }
    if (!$("#navi-button").hasClass("collapsed"))
      $("#navi-button").click();
    if (history.state)
      if (history.state.state != n) history.pushState({
        state: n
      }, null, null);
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

  RGZ.faqClicked = function(e) {
    if ($(e).hasClass("faq-expanded"))
      $(".faq-link").removeClass("faq-expanded").css({
        "cursor": "pointer",
        "color": "#333"
      });
    else {
      $(".faq-link").removeClass("faq-expanded").css({
        "cursor": "pointer",
        "color": "#333"
      });
      $(e).addClass("faq-expanded").css({
        "cursor": "pointer",
        "color": "#F4F8E6"
      });;
    }
  };

  RGZ.faqMouseOver = function(e) {
    $(e).css({
      "cursor": "pointer",
      "color": "#F4F8E6"
    });
  };

  RGZ.faqMouseOut = function(e) {
    if (!$(e).hasClass("faq-expanded"))
      $(e).css({
        "cursor": "default",
        "color": "#333"
      });
  };

  global.$RGZ = RGZ;
})(window);
