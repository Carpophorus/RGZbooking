(function(global) {
  RGZ = {};

  RGZ.bearer = '';

  RGZ.apiRoot = 'https://rgzapi.azurewebsites.net/api/';
  RGZ.salteriSluzbe = '';
  RGZ.zahtevi = '';
  RGZ.kancelarijeSluzbe = '';
  RGZ.salteriTermini = '';
  RGZ.kancelarijeTermini = '';
  RGZ.zakazaniTermini = '';

  var bookingForbidden = false;
  var nav = 0;
  var confirmArrivalClicked = false;
  var fetchCounterTimesClicked = false;
  var fetchOfficeTimesClicked = false;

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
    if ($("#book-content").length == 0) return;
    appear($("#book-content>.content-box-loader"), 200);
    var sync = 0;
    $ajaxUtils.sendGetRequest(
      RGZ.apiRoot + "salteri/sluzbe",
      function(responseArray, status) {
        RGZ.salteriSluzbe = responseArray;
        sync = sync + 1;
        if (sync == 3) RGZ.loadBookContent();
      },
      true /*, RGZ.bearer*/
    );
    $ajaxUtils.sendGetRequest(
      RGZ.apiRoot + "salteri/zahtevi",
      function(responseArray, status) {
        RGZ.zahtevi = responseArray;
        sync = sync + 1;
        if (sync == 3) RGZ.loadBookContent();
      },
      true /*, RGZ.bearer*/
    );
    $ajaxUtils.sendGetRequest(
      RGZ.apiRoot + "kancelarije/sluzbe",
      function(responseArray, status) {
        RGZ.kancelarijeSluzbe = responseArray;
        sync = sync + 1;
        if (sync == 3) RGZ.loadBookContent();
      },
      true /*, RGZ.bearer*/
    );
    RGZ.footMouseOver();
    setTimeout(RGZ.footMouseOut, 2000);
  });

  RGZ.loadBookContent = function() {
    var bookHtml = `
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
    `;
    for (var i = 0; i < RGZ.salteriSluzbe.length; i++)
      bookHtml += `<option value="` + RGZ.salteriSluzbe[i].id + `">` + RGZ.salteriSluzbe[i].sluzba + `</option>`;
    bookHtml += `
        </select>
        <div class="form-search-button-container"><div class="form-search-button" onclick="$RGZ.fetchCounterTimes();">ПРЕТРАГА</div></div>
        <select id="counter-day-select" class="gone" onchange="$RGZ.bookCounterDay();">
        </select>
        <select id="counter-time-select" class="gone" onchange="$RGZ.bookCounterTime();">
        </select>
        <div id="book-counter-aux" class="aux-container gone">
          <input id="book-counter-name" placeholder="име и презиме ✱" onfocus="this.placeholder=''" onblur="this.placeholder='име и презиме ✱'">
          <select id="book-counter-reason" onchange="$RGZ.counterReasonChanged();">
            <option disabled value="0" selected hidden>врста захтева ✱</option>
    `;
    for (var i = 0; i < RGZ.zahtevi.length; i++)
      bookHtml += `<option value="` + RGZ.zahtevi[i].id + `">` + RGZ.zahtevi[i].opis + `</option>`;
    bookHtml += `
          </select>
          <input id="book-counter-phone" placeholder="телефон" onfocus="this.placeholder=''" onblur="this.placeholder='телефон'">
          <input id="book-counter-mail" placeholder="e-mail" onfocus="this.placeholder=''" onblur="this.placeholder='e-mail'">
          <div id="book-counter-check" onclick="RGZ.checkboxClicked(this);"><i class="fa fa-square-o"></i></div>
          <label class="checkbox-label" onclick="RGZ.checkboxClicked($('#book-counter-check'));">Потврђујем да имам потпуну и правилно попуњену документацију, као и исправно уплаћене таксе за захтев/упис/предмет због којег заказујем термин. У случају кашњења, доношења непотпуне/неправилне документације или неуплаћене таксе, пристајем да наредна странка буде услужена и/или да будем упућен/а на редован шалтер. Прихватам и ограничења да шалтер/служба неће извршити пријем лица уколико се захтев/предмет због којег се заказује термин не односи на то лице (осим у случају постојања одговарајућег овлашћења) и да се у време пријема не може извршити измена пријаве или неисправне документације, већ да је потребно поднети нову.</label>
          <div class="form-button" onclick="$RGZ.bookCounter();">ЗАКАЖИ</div>
        </div>
      </div>
      <div id="book-offices" class="gone">
        <select id="office-select" onchange="$RGZ.officeDepartmentChanged();">
          <option disabled value="0" selected hidden>ИЗАБЕРИТЕ СЛУЖБУ...</option>
    `;
    for (var i = 0; i < RGZ.kancelarijeSluzbe.length; i++)
      bookHtml += `<option value="` + RGZ.kancelarijeSluzbe[i].id + `">` + RGZ.kancelarijeSluzbe[i].sluzba + `</option>`;
    bookHtml += `
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
          <input id="book-office-phone" placeholder="телефон" onfocus="this.placeholder=''" onblur="this.placeholder='телефон'">
          <input id="book-office-mail" placeholder="e-mail" onfocus="this.placeholder=''" onblur="this.placeholder='e-mail'">
          <div id="book-office-check" onclick="RGZ.checkboxClicked(this);"><i class="fa fa-square-o"></i></div>
          <label class="checkbox-label" onclick="RGZ.checkboxClicked($('#book-office-check'));">Потврђујем да имам потпуну и правилно попуњену документацију, као и исправно уплаћене таксе за захтев/упис/предмет због којег заказујем термин. У случају кашњења, доношења непотпуне/неправилне документације или неуплаћене таксе, пристајем да наредна странка буде услужена и/или да будем упућен/а на редован шалтер. Прихватам и ограничења да шалтер/служба неће извршити пријем лица уколико се захтев/предмет због којег се заказује термин не односи на то лице (осим у случају постојања одговарајућег овлашћења) и да се у време пријема не може извршити измена пријаве или неисправне документације, већ да је потребно поднети нову.</label>
          <div class="form-button" onclick="$RGZ.bookOffice();">ЗАКАЖИ</div>
        </div>
      </div>
    `;
    insertHtml("#book-content>.content-box-content", bookHtml);
    disappear($(".content-box-loader"), 200);
    setTimeout(function() {
      appear($("#book-content>.content-box-content"), 500);
    }, 200);
  };

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

  RGZ.recaptchaCallback = function(token) {
    if (nav == 0) {
      var data = RGZ.salteriTermini[$("#counter-time-select option:selected").attr("value")];
      data.ime = $("#book-counter-name").val();
      data.dokumentId = $("#book-counter-reason option:selected").attr("value");
      data.tel = $("#book-counter-phone").val();
      data.email = $("#book-counter-mail").val();
      data = JSON.stringify(data);
      $ajaxUtils.sendPostRequestWithData(
        RGZ.apiRoot + "salteri/zakazitermin" + "?token=" + encodeURIComponent(token),
        function(responseArray, status) {
          $(".jconfirm").remove();
          var detailsText = `
            Детаљи заказаног термина:
            <br><br>
            <ul>
              <li>име: ` + responseArray.ime + `</li>
              <li>датум: ` + responseArray.datum.substring(8, 10) + '.' + responseArray.datum.substring(5, 7) + '.' + responseArray.datum.substring(0, 4) + '.' + `</li>
              <li>време: ` + responseArray.termin + `</li>
              <li>број/име шалтера: ` + responseArray.salter + `</li>
              <li>назив службе: ` + responseArray.sluzba + `</li>
              <li>адреса службе: ` + responseArray.adresa + `</li>
            </ul>
          `;
          $.confirm({
            title: 'ЗАКАЗИВАЊЕ УСПЕШНО!',
            content: detailsText,
            theme: 'supervan',
            buttons: {
              ok: {
                text: 'ОК',
                btnClass: 'btn-white-rgz',
                keys: ['enter'],
                action: function() {
                  RGZ.counterDepartmentChanged();
                  $("#book-counter-aux>input").val("");
                  $("#book-counter-aux>select option:selected").prop("selected", false);
                  $("#book-counter-aux>select option:first-child").prop("selected", true);
                  $("#book-counter-check>i").removeClass("fa-check-square-o").addClass("fa-square-o");
                }
              }
            }
          });
        },
        true, data /*, RGZ.bearer*/
      );
    } else if (nav == 1) {
      var data = RGZ.kancelarijeTermini[$("#office-time-select option:selected").attr("value")];
      data.ime = $("#book-office-name").val();
      data.tel = $("#book-office-phone").val();
      data.email = $("#book-office-mail").val();
      data = JSON.stringify(data);
      $ajaxUtils.sendPostRequestWithData(
        RGZ.apiRoot + "kancelarije/zakazitermin" + "?token=" + encodeURIComponent(token),
        function(responseArray, status) {
          $(".jconfirm").remove();
          var detailsText = `
            Детаљи заказаног термина:
            <br><br>
            <ul>
              <li>име: ` + responseArray.ime + `</li>
              <li>датум: ` + responseArray.datum.substring(8, 10) + '.' + responseArray.datum.substring(5, 7) + '.' + responseArray.datum.substring(0, 4) + '.' + `</li>
              <li>време: ` + responseArray.termin + `</li>
              <li>бр. предмета: ` + responseArray.broj_dok + `</li>
              <li>надлежна канцеларија: ` + responseArray.kancelarija + `</li>
              <li>назив службе: ` + responseArray.sluzba + `</li>
              <li>адреса службе: ` + responseArray.adresa + `</li>
            </ul>
          `;
          $.confirm({
            title: 'ЗАКАЗИВАЊЕ УСПЕШНО!',
            content: detailsText,
            theme: 'supervan',
            buttons: {
              ok: {
                text: 'ОК',
                btnClass: 'btn-white-rgz',
                keys: ['enter'],
                action: function() {
                  RGZ.officeDepartmentChanged();
                  $("#book-office-aux>input").val("");
                  $("#book-office-aux>select option:selected").prop("selected", false);
                  $("#book-office-aux>select option:first-child").prop("selected", true);
                  $("#book-office-check>i").removeClass("fa-check-square-o").addClass("fa-square-o");
                }
              }
            }
          });
        },
        true, data /*, RGZ.bearer*/
      );
    }
  };

  RGZ.checkboxClicked = function(e) {
    if ($(e).find("i").hasClass("fa-square-o"))
      $(e).find("i").removeClass("fa-square-o").addClass("fa-check-square-o");
    else
      $(e).find("i").addClass("fa-square-o").removeClass("fa-check-square-o");
  };

  RGZ.bookSwitch = function(n) {
    if (n == 0 && nav == 1) {
      disappear($("#book-offices"), 500);
      setTimeout(function() {
        appear($("#book-counters"), 500);
      }, 510);
      nav = 0;
    }
    if (n == 1 && nav == 0) {
      disappear($("#book-counters"), 500);
      setTimeout(function() {
        appear($("#book-offices"), 500);
        $(".subj-input-container").width($("#subj-select").innerWidth() - $(".subj-1").innerWidth());
      }, 510);
      nav = 1;
    }
  };

  RGZ.counterDepartmentChanged = function() {
    if (fetchCounterTimesClicked == true) {
      fetchCounterTimesClicked = false;
      return;
    }
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
    if (fetchOfficeTimesClicked == true) {
      fetchOfficeTimesClicked = false;
      return;
    }
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

  RGZ.counterReasonChanged = function() {
    //
  };

  RGZ.fetchCounterTimes = function() {
    fetchCounterTimesClicked = true;
    if ($("#counter-select option:selected").val() == 0) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Морате прво изабрати службу у којој желите да закажете шалтерски термин.',
        theme: 'supervan',
        backgroundDismiss: 'true',
        buttons: {
          ok: {
            text: 'ОК',
            btnClass: 'btn-white-rgz',
            keys: ['enter'],
            action: function() {}
          }
        }
      });
      return;
    }
    $("#counter-select").prop("disabled", true);
    $(".content-box-loader").css({
      "padding-top": "45vh"
    });
    appear($(".content-box-loader"), 200);
    disappear($("#counter-time-select, #counter-day-select"), 500);
    RGZ.counterDepartmentChanged();
    setTimeout(function() {
      $ajaxUtils.sendGetRequest(
        RGZ.apiRoot + "salteri/termini" + "?sluzbaId=" + $("#counter-select option:selected").attr("value"),
        function(responseArray, status) {
          RGZ.salteriTermini = responseArray;
          var datumi = [];
          for (var i = 0; i < RGZ.salteriTermini.length; i++) {
            if (!datumi.includes(RGZ.salteriTermini[i].datum)) {
              datumi.push(RGZ.salteriTermini[i].datum);
            }
          }
          var selectDayHtml = `
            <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ДАТУМ...</option>
          `;
          for (var i = 0; i < datumi.length; i++) {
            var localizedDate = datumi[i].substring(8, 10) + '.' + datumi[i].substring(5, 7) + '.' + datumi[i].substring(0, 4) + '.';
            selectDayHtml += `<option value="` + datumi[i] + `">` + localizedDate + `</option>`;
          }
          insertHtml("#counter-day-select", selectDayHtml);
          var selectTimeHtml = `
            <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ТЕРМИН...</option>
            <option disabled value="0">ПРВО ИЗАБЕРИТЕ ДАТУМ</option>
          `;
          insertHtml("#counter-time-select", selectTimeHtml);
          appear($("#counter-time-select, #counter-day-select"), 500);
          disappear($(".content-box-loader"), 200);
          $("#counter-select").prop("disabled", false);
        },
        true /*, RGZ.bearer*/
      );
    }, 500);
  };

  RGZ.fetchOfficeTimes = function() {
    fetchOfficeTimesClicked = true;
    if ($("#office-select option:selected").val() == 0 || $("#subj-type").val() == "" || $("#subj-id").val() == "" || $("#subj-year").val() == "") {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Морате прво изабрати службу у којој желите да закажете канцеларијски термин и уписати број свог предмета.',
        theme: 'supervan',
        backgroundDismiss: 'true',
        buttons: {
          ok: {
            text: 'ОК',
            btnClass: 'btn-white-rgz',
            keys: ['enter'],
            action: function() {}
          }
        }
      });
      return;
    }
    $("#office-select, #subj-type, #subj-id, #subj-year").prop("disabled", true);
    $(".content-box-loader").css({
      "padding-top": "56vh"
    });
    appear($(".content-box-loader"), 200);
    disappear($("#office-time-select, #office-day-select"), 500);
    RGZ.officeDepartmentChanged();
    setTimeout(function() {
      $ajaxUtils.sendGetRequest(
        RGZ.apiRoot + "kancelarije/termini" + "?sluzbaId=" + $("#office-select option:selected").attr("value") + "&broj_dok=" + encodeURIComponent("952-02-" + $("#subj-type").val() + "-" + $("#subj-id").val() + "-" + $("#subj-year").val()),
        function(responseArray, status) {
          RGZ.kancelarijeTermini = responseArray;
          var datumi = [];
          for (var i = 0; i < RGZ.kancelarijeTermini.length; i++) {
            if (!datumi.includes(RGZ.kancelarijeTermini[i].datum)) {
              datumi.push(RGZ.kancelarijeTermini[i].datum);
            }
          }
          var selectDayHtml = `
            <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ДАТУМ...</option>
          `;
          for (var i = 0; i < datumi.length; i++) {
            var localizedDate = datumi[i].substring(8, 10) + '.' + datumi[i].substring(5, 7) + '.' + datumi[i].substring(0, 4) + '.';
            selectDayHtml += `<option value="` + datumi[i] + `">` + localizedDate + `</option>`;
          }
          insertHtml("#office-day-select", selectDayHtml);
          var selectTimeHtml = `
            <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ТЕРМИН...</option>
            <option disabled value="0">ПРВО ИЗАБЕРИТЕ ДАТУМ</option>
          `;
          insertHtml("#office-time-select", selectTimeHtml);
          appear($("#office-time-select, #office-day-select"), 500);
          disappear($(".content-box-loader"), 200);
          $("#office-select, #subj-type, #subj-id, #subj-year").prop("disabled", false);
        },
        true /*, RGZ.bearer*/
      );
    }, 500);
  };

  RGZ.bookCounterDay = function() {
    var selectTimeHtml = `
      <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ТЕРМИН...</option>
    `;
    for (var i = 0; i < RGZ.salteriTermini.length; i++)
      if (RGZ.salteriTermini[i].datum == $("#counter-day-select option:selected").attr("value"))
        selectTimeHtml += `<option value="` + i + `">` + RGZ.salteriTermini[i].termin + `</option>`;
    insertHtml("#counter-time-select", selectTimeHtml);
  };

  RGZ.bookCounterTime = function() {
    $("#book-counter-aux").removeClass("gone");
    $(".content-box-content").animate({
      scrollTop: $("#book-counter-aux").offset().top - $(".btn-group").offset().top
    }, 1500);
    setTimeout(function() {
      appear($("#book-counter-aux"), 1000);
    }, 10);
  };

  RGZ.bookOfficeDay = function() {
    var selectTimeHtml = `
      <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ТЕРМИН...</option>
    `;
    for (var i = 0; i < RGZ.kancelarijeTermini.length; i++)
      if (RGZ.kancelarijeTermini[i].datum == $("#office-day-select option:selected").attr("value"))
        selectTimeHtml += `<option value="` + i + `">` + RGZ.kancelarijeTermini[i].termin + `</option>`;
    insertHtml("#office-time-select", selectTimeHtml);
  };

  RGZ.bookOfficeTime = function() {
    $("#book-office-aux").removeClass("gone");
    $(".content-box-content").animate({
      scrollTop: $("#book-office-aux").offset().top - $(".btn-group").offset().top
    }, 1500);
    setTimeout(function() {
      appear($("#book-office-aux"), 1000);
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

  RGZ.bookCounter = function() {
    if (bookingForbidden == true) return;
    if ($("#book-counter-name").val() == "" || $("#book-counter-reason option:selected").attr("value") == 0 || $("#book-counter-check i").hasClass("fa-square-o")) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Морате исправно попунити барем обавезна поља (означена звездицом) и прихватити услове коришћења заказивача.',
        theme: 'supervan',
        backgroundDismiss: 'true',
        buttons: {
          ok: {
            text: 'ОК',
            btnClass: 'btn-white-rgz',
            keys: ['enter'],
            action: function() {}
          }
        }
      });
      return;
    }
    $.confirm({
      title: 'ПОТВРДА',
      content: 'Да ли желите да закажете термин на шалтеру са унетим параметрима?<br><br><span>Молимо Вас да проверите све податке унете у претходном кораку пре заказивања. Када почне процес заказивања, молимо Вас да останете на страници до приказивања повратних информација.</span>',
      theme: 'supervan',
      backgroundDismiss: 'true',
      autoClose: 'no|20000',
      buttons: {
        no: {
          text: 'НЕ',
          btnClass: 'btn-white-rgz',
          keys: ['esc'],
          action: function() {}
        },
        yes: {
          text: 'ДА',
          btnClass: 'btn-white-rgz',
          keys: ['enter'],
          action: function() {
            $.confirm({
              title: 'МОЛИМО САЧЕКАЈТЕ',
              content: 'Обрада Вашег захтева је у току...',
              theme: 'supervan',
              buttons: {
                ok: {
                  text: 'ОК',
                  btnClass: 'gone',
                  action: function() {}
                }
              }
            });
            setTimeout(function() {
              grecaptcha.reset();
              grecaptcha.execute();
            }, 10);
          }
        },
      }
    });
  };

  RGZ.bookOffice = function() {
    if (bookingForbidden == true) return;
    if ($("#book-office-name").val() == "" || $("#book-office-check i").hasClass("fa-square-o")) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Морате исправно попунити барем обавезна поља (означена звездицом) и прихватити услове коришћења заказивача.',
        theme: 'supervan',
        backgroundDismiss: 'true',
        buttons: {
          ok: {
            text: 'ОК',
            btnClass: 'btn-white-rgz',
            keys: ['enter'],
            action: function() {}
          }
        }
      });
      return;
    }
    $.confirm({
      title: 'ПОТВРДА',
      content: 'Да ли желите да закажете канцеларијски термин са унетим параметрима?<br><br><span>Молимо Вас да проверите све податке унете у претходном кораку пре заказивања. Када почне процес заказивања, молимо Вас да останете на страници до приказивања повратних информација.</span>',
      theme: 'supervan',
      backgroundDismiss: 'true',
      autoClose: 'no|20000',
      buttons: {
        no: {
          text: 'НЕ',
          btnClass: 'btn-white-rgz',
          keys: ['esc'],
          action: function() {}
        },
        yes: {
          text: 'ДА',
          btnClass: 'btn-white-rgz',
          keys: ['enter'],
          action: function() {
            $.confirm({
              title: 'МОЛИМО САЧЕКАЈТЕ',
              content: 'Обрада Вашег захтева је у току...',
              theme: 'supervan',
              buttons: {
                ok: {
                  text: 'ОК',
                  btnClass: 'gone',
                  action: function() {}
                }
              }
            });
            setTimeout(function() {
              grecaptcha.reset();
              grecaptcha.execute();
            }, 10);
          }
        },
      }
    });
  };

  RGZ.scheduleForgotPassword = function() {
    if ($("#schedule-username").val() == "") {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Морате унети корисничко име за налог којем се ресетује шифра.',
        theme: 'supervan',
        backgroundDismiss: 'true',
        buttons: {
          ok: {
            text: 'ОК',
            btnClass: 'btn-white-prm',
            keys: ['enter'],
            action: function() {}
          }
        }
      });
      return;
    }
    $.confirm({
      title: 'ПОТВРДА',
      content: 'Да ли сте сигурни да желите да ресетујете шифру за налог са корисничким именом "' + $("#schedule-username").val() + '"?<br><br><span>Нова шифра ће бити послата на одговарајућу e-mail адресу.</span>',
      theme: 'supervan',
      backgroundDismiss: 'true',
      autoClose: 'no|10000',
      buttons: {
        no: {
          text: 'НЕ',
          btnClass: 'btn-white-rgz',
          keys: ['esc'],
          action: function() {}
        },
        yes: {
          text: 'ДА',
          btnClass: 'btn-white-rgz',
          keys: ['enter'],
          action: function() {
            $.confirm({
              title: 'МОЛИМО САЧЕКАЈТЕ',
              content: 'Обрада Вашег захтева је у току...',
              theme: 'supervan',
              buttons: {
                ok: {
                  text: 'ОК',
                  btnClass: 'gone',
                  action: function() {}
                }
              }
            });
            $ajaxUtils.sendPutRequest(
              RGZ.apiRoot + "korisnici/resetujSifru" + "?korisnik=" + $("#schedule-username").val(),
              function(responseArray, status) {
                $(".jconfirm").remove();
                $.confirm({
                  title: 'ЛОЗИНКА РЕСЕТОВАНА',
                  content: 'Лозинка за налог са корисничким именом "' + $("#schedule-username").val() + '" успешно је промењена.<br><br><span>Користите подразумевану лозинку приликом наредне пријаве на систем путем овог налога.</span>',
                  theme: 'supervan',
                  backgroundDismiss: 'true',
                  buttons: {
                    ok: {
                      text: 'ОК',
                      btnClass: 'btn-white-prm',
                      keys: ['enter'],
                      action: function() {}
                    }
                  }
                });
              },
              true /*, RGZ.bearer*/
            );
          }
        }
      }
    });
  };

  RGZ.scheduleLogin = function() {
    if ($("#schedule-username").val() == "" || $("#schedule-password").val() == "") {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Морате унети и корисничко име и шифру.',
        theme: 'supervan',
        backgroundDismiss: 'true',
        buttons: {
          ok: {
            text: 'ОК',
            btnClass: 'btn-white-prm',
            keys: ['enter'],
            action: function() {}
          }
        }
      });
      return;
    }
    disappear($(".content-box-content"), 500);
    appear($(".content-box-loader"), 200);
    $("#schedule-username, #schedule-password").attr("disabled", true);
    var data = "username=" + encodeURIComponent($("#schedule-username").val()) + "&password=" + encodeURIComponent($("#schedule-password").val()) + "&grant_type=password&client_id=837rgz";
    $.post(RGZ.apiRoot.substring(0, RGZ.apiRoot.length - 4) + "token", data, function(response) {
      RGZ.bearer = response.access_token;
      $ajaxUtils.sendGetRequest(
        RGZ.apiRoot + "korisnici/zakazaniTermini",
        function(responseArray, status) {
          RGZ.zakazaniTermini = responseArray;
          var qualifiedSalteri = [];
          for (var i = 0; i < RGZ.zakazaniTermini.length; i++) {
            if (!qualifiedSalteri.includes(RGZ.zakazaniTermini[i].salter)) {
              qualifiedSalteri.push(RGZ.zakazaniTermini[i].salter);
            }
          }
          var scheduleContentHtml = `
            <div id="schedule-print" class="schedule-navi-button hidden-md-down gone" onclick="$RGZ.schedulePrint();"><i class="fa fa-print"></i></div>
            <div id="schedule-password-change" class="schedule-navi-button hidden-md-down" onclick="$RGZ.schedulePasswordChange();"><i class="fa fa-key"></i></div>
            <div id="schedule-logout" class="schedule-navi-button" onclick="$RGZ.scheduleLogout();"><i class="fa fa-sign-out"></i></div>
            <div id="schedule-searchbar" class="row">
              <div class="col-lg-4 hidden-md-down"></div>
              <div class="col-12 col-lg-4">
                <select id="schedule-co" onchange="$RGZ.scheduleSearch();">
                  <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ШАЛТЕР/КАНЦЕЛАРИЈУ...</option>
          `;
          for (var i = 0; i < qualifiedSalteri.length; i++)
            scheduleContentHtml += `<option>` + qualifiedSalteri[i] + `</option>`
          scheduleContentHtml += `
                </select>
              </div>
              <div class="col-lg-4 hidden-md-down"></div>
            </div>
            <div id="timetable" class="gone"></div>
          `;
          insertHtml("#schedule-content .content-box-content", scheduleContentHtml);
          setTimeout(function() {
            appear($(".content-box-content"), 500);
            disappear($(".content-box-loader"), 200);
          }, 500);
        },
        true, RGZ.bearer
      );
    }).fail(function(response) {
      if (response.status == 400) {
        var errorText = response.responseJSON.error;
        setTimeout(function() {
          appear($(".content-box-content"), 500);
          disappear($(".content-box-loader"), 200);
        }, 500);
        $(".jconfirm").remove();
        $("input, select").prop("disabled", false);
        $.confirm({
          title: 'ГРЕШКА!',
          content: errorText + '.',
          theme: 'supervan',
          backgroundDismiss: 'true',
          buttons: {
            ok: {
              text: 'ОК',
              btnClass: 'btn-white-rgz',
              keys: ['enter'],
              action: function() {}
            }
          }
        });
      } else {
        setTimeout(function() {
          appear($(".content-box-content"), 500);
          disappear($(".content-box-loader"), 200);
        }, 500);
        $(".jconfirm").remove();
        $("input, select").prop("disabled", false);
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Десила се грешка у систему, покушајте поново касније.',
          theme: 'supervan',
          backgroundDismiss: 'true',
          buttons: {
            ok: {
              text: 'ОК',
              btnClass: 'btn-white-rgz',
              keys: ['enter'],
              action: function() {
                $(".jconfirm").remove();
              }
            }
          }
        });
      }
    });
  };

  RGZ.schedulePasswordChange = function() {
    $.confirm({
      title: 'ПРОМЕНА ЛОЗИНКЕ',
      content: 'Нова лозинка:<br><br><input id="password-change-input-box" type="password">',
      theme: 'supervan',
      buttons: {
        no: {
          text: '<i class="fa fa-times"></i>',
          btnClass: 'btn-white-rgz',
          keys: ['esc'],
          action: function() {}
        },
        yes: {
          text: '<i class="fa fa-check"></i>',
          btnClass: 'btn-white-rgz',
          keys: ['enter'],
          action: function() {
            $ajaxUtils.sendPutRequest(
              RGZ.apiRoot + "korisnici/izmenisifru" + "?novaSifra=" + encodeURIComponent($("#password-change-input-box").val()),
              function(responseArray, status) {
                $(".jconfirm").remove();
                $.confirm({
                  title: 'ЛОЗИНКА ПРОМЕЊЕНА',
                  content: 'Лозинка за текући налог успешно је промењена.<br><br><span>Користите нову лозинку приликом наредне пријаве на систем путем овог налога.</span>',
                  theme: 'supervan',
                  backgroundDismiss: 'true',
                  buttons: {
                    ok: {
                      text: 'ОК',
                      btnClass: 'btn-white-prm',
                      keys: ['enter'],
                      action: function() {}
                    }
                  }
                });
              },
              true /*, RGZ.bearer*/
            );
          }
        }
      }
    });
  };

  RGZ.scheduleSearch = function() {
    disappear($("#timetable"), 500);
    disappear($("#schedule-print"), 500);
    var ttHtml = `
      <div id="schedule-header" class="row">
        <div class="col-1"></div>
        <div class="col-3 col-lg-2"><span class="hidden-sm-down">време</span><i class="hidden-md-up fa fa-clock-o"></i></div>
        <div class="col-4 col-lg-7"><span class="hidden-sm-down">име и презиме</span><i class="hidden-md-up fa fa-user"></i></div>
        <div class="col-4 col-lg-2"><span class="hidden-sm-down">потврда доласка</span><i class="hidden-md-up fa fa-check"></i><span class="hidden-md-up" id="slash">&nbsp;/&nbsp;</span><i class="hidden-md-up fa fa-times"></i></div>
      </div>
      <div id="schedule-items">
    `;
    for (var i = 0; i < RGZ.zakazaniTermini.length; i++) {
      if (RGZ.zakazaniTermini[i].salter == $("#schedule-co").val())
        ttHtml += `
          <div class="schedule-item row" id="item-` + i + `" onclick="$RGZ.scheduleItemClicked(` + i + `, this);">
            <div class="col-1 item-indicator"><i class="fa fa-circle pulse hidden"></i></div>
            <div class="col-3 col-lg-2 item-time">` + RGZ.zakazaniTermini[i].termin + `</div>
            <div class="col-4 col-lg-7 item-name">` + RGZ.zakazaniTermini[i].ime + `</div>
            <div class="col-2 col-lg-1 item-y ` + ((RGZ.zakazaniTermini[i].potvrda == true) ? `arrival` : ((RGZ.zakazaniTermini[i].potvrda == false) ? `arrival-counter` : ``)) + `" onclick="$RGZ.confirmArrival(this, ` + RGZ.zakazaniTermini[i].id + `);"><i class="fa fa-check"></i></div>
            <div class="col-2 col-lg-1 item-n ` + ((RGZ.zakazaniTermini[i].potvrda == false) ? `arrival` : ((RGZ.zakazaniTermini[i].potvrda == true) ? `arrival-counter` : ``)) + `" onclick="$RGZ.confirmArrival(this, ` + RGZ.zakazaniTermini[i].id + `);"><i class="fa fa-times"></i></div>
          </div>
          <div id="expansion-` + i + `" class="expansion collapse">
            <div class="row">
              <div class="expansion-info col-12 col-md-6">
                <div class="expansion-label">датум и време:</div>
                <div class="expansion-info-data">` + RGZ.zakazaniTermini[i].datum.substring(3, 5) + `.` + RGZ.zakazaniTermini[i].datum.substring(0, 2) + `.` + RGZ.zakazaniTermini[i].datum.substring(6, 11) + `. ` + RGZ.zakazaniTermini[i].termin + `</div>
                <div class="expansion-label">име и презиме:</div>
                <div class="expansion-info-data">` + RGZ.zakazaniTermini[i].ime + `</div>` + ((RGZ.zakazaniTermini[i].email != "" && RGZ.zakazaniTermini[i].email != null) ? `
                <div class="expansion-label">e-mail:</div>
                <div class="expansion-info-data">` + RGZ.zakazaniTermini[i].email + `</div>
                ` : ``) + ((RGZ.zakazaniTermini[i].tel != "" && RGZ.zakazaniTermini[i].tel != null) ? `
                <div class="expansion-label">телефон:</div>
                <div class="expansion-info-data">` + RGZ.zakazaniTermini[i].tel + `</div>
                ` : ``) + `
                <div class="expansion-label">документ:</div>
                <div class="expansion-info-data">` + RGZ.zakazaniTermini[i].dokument + `</div>
              </div>
            </div>
          </div>
        `;
    }
    ttHtml += `
      </div>
    `;
    setTimeout(function() {
      insertHtml("#timetable", ttHtml);
    }, 500);
    setTimeout(function() {
      appear($("#timetable"), 500);
      appear($("#schedule-print"), 500);
      setTimeout(RGZ.currentClientIndicator, 10);
    }, 600);
  };

  RGZ.confirmArrival = function(e) {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    confirmArrivalClicked = true;
    if ($(e).hasClass("arrival") || $(e).hasClass("arrival-counter")) {
      confirmArrivalClicked = false;
      return;
    } else if (hours * 100 + minutes - 5 < Number($(e).parent().find(".item-time").html().replace(':', ''))) { //and later date
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Не можете потврдити долазак клијента у будућности.<br><br><span>Предвиђено је максимално кашњење од 5 минута.</span>',
        theme: 'supervan',
        backgroundDismiss: 'true',
        buttons: {
          ok: {
            text: 'ОК',
            btnClass: 'btn-white-rgz',
            keys: ['enter'],
            action: function() {}
          }
        }
      });
      return;
    }
    $.confirm({
      title: 'ПАЖЊА!',
      content: 'Да ли сте сигурни да желите да евидентирате да клијент (' + $(e).parent().find(".item-name").html() + (($(e).hasClass("item-y")) ? ') ЈЕСТЕ' : ') НИЈЕ') + ' ДОШАО у заказано време (' + $(e).parent().find(".item-time").html() + ')?',
      theme: 'supervan',
      backgroundDismiss: 'true',
      autoClose: 'no|10000',
      buttons: {
        no: {
          text: 'НЕ',
          btnClass: 'btn-white-rgz',
          keys: ['esc'],
          action: function() {}
        },
        yes: {
          text: 'ДА',
          btnClass: 'btn-white-rgz',
          keys: ['enter'],
          action: function() {
            //send api request
            //maybe change local array
            $(e).addClass("arrival");
            $(e).parent().find((($(e).hasClass("item-y")) ? ".item-n" : ".item-y")).addClass("arrival-counter");
          }
        }
      }
    });
  };

  RGZ.scheduleItemClicked = function(n, e) {
    if (confirmArrivalClicked == true) {
      confirmArrivalClicked = false;
      return;
    }
    var wasExpanded = $(e).hasClass("expanded");
    $(".schedule-item").removeClass("expanded");
    $(".expansion").collapse('hide');
    if (wasExpanded == false) {
      $(e).addClass("expanded");
      $("#expansion-" + n).collapse('show');
      $("#schedule-items").animate({
        scrollTop: $(e).index() / 2 * 7 * window.innerHeight / 100
      }, 500);
    }
  };

  RGZ.schedulePrint = function() {
    $.confirm({
      title: 'ПОТВРДА',
      content: `Уколико желите додатак наслову на документу за штампу, унесите га у ово поље:<br><br><input id="print-title" type="text" placeholder="наслов" onfocus="this.placeholder = ''" onblur="this.placeholder = 'наслов'">`,
      theme: 'supervan',
      backgroundDismiss: 'true',
      buttons: {
        cancel: {
          text: '<i class="fa fa-times"></i>',
          btnClass: 'btn-white-prm',
          keys: ['esc'],
          action: function() {}
        },
        print: {
          text: '<i class="fa fa-print"></i>',
          btnClass: 'btn-white-prm',
          keys: ['enter'],
          action: function() {
            var printTitle = "date and &bull; other info" + " &bull; " + $("#print-title").val();
            var html4print = `
                <head><title>` + printTitle + `</title></head>
                <body>
                  <div class="header">
                    <div class="inner-s">р.б.</div>
                    <div class="inner-xl">бр. предмета</div>
                    <div class="inner-l">датум</div>
                    <div class="inner-xl">име и презиме</div>
                    <div class="inner-xl">e-mail</div>
                    <div class="inner-l">телефон</div>
                    <div class="inner-l">служба</div>
                    <div class="inner-l">статус</div>
                    <div class="inner-l">одговор</div>
                  </div>
              `;
            for (var i = 0; i < 50; i++) {
              html4print += `
                  <div class="outer">
                    <div class="inner-s">` + `123` + `</div>
                    <div class="inner-xl">` + `95-74993678/2017` + `</div>
                    <div class="inner-l">` + `10.11.2017. 08:51` + `</div>
                    <div class="inner-xl">` + `Radibrat Radibratović` + `</div>
                    <div class="inner-xl">` + `rr69@gmail.com` + `</div>
                    <div class="inner-l">` + `069/555-78-03` + `</div>
                    <div class="inner-l">` + `Велика Плана` + `</div>
                    <div class="inner-l">` + `Непрослеђен` + `</div>
                    <div class="inner-l">` + `Нема одговора` + `</div>
                  </div>
                `;
            }
            html4print += `
                </body>
                <style>
                  body {
                    margin: 0;
                    -webkit-print-color-adjust: exact;
                  }
                  .header, .outer {
                    position: relative;
                    width: 100%;
                    font-size: 65%;
                    overflow: auto;
                  }
                  .header {
                    color: white;
                    font-weight: bold;
                    background-color: #444;
                  }
                  .outer:nth-child(odd) {
                    background-color: #eee !important;
                  }
                  .header>div, .outer>div {
                    float: left;
                    white-space: nowrap;
                    overflow: hidden !important;
                    text-overflow: ellipsis;
                    line-height: 2;
                  }
                  .inner-s {
                    width: 5%;
                  }
                  .inner-l {
                    width: 10%;
                  }
                  .inner-xl {
                    width: 15%;
                  }
                </style>
              `;

            w = window.open("");
            w.document.write(html4print);
            w.print();
            w.close();
          }
        }
      }
    });
    //generate html (prompt for all or screen?)
  };

  RGZ.currentClientIndicator = function() {
    //if later date: return
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    setTimeout(RGZ.currentClientIndicator, (61 - seconds) * 1000);
    var minDiff = 333333;
    var timeAux = hours * 100 + minutes;
    $(".schedule-item").each(function() {
      var timeFromString = Number($(this).find(".item-time").html().replace(':', ''));
      if (timeAux - timeFromString >= 0 && timeAux - timeFromString < minDiff) {
        minDiff = timeAux - timeFromString;
        $(".item-indicator i").addClass("hidden");
        $(this).find(".item-indicator i").removeClass("hidden");
      }
    });
  };

  RGZ.scheduleLogout = function() {
    $.confirm({
      title: 'ПАЖЊА!',
      content: 'Да ли сте сигурни да желите да се одјавите?',
      theme: 'supervan',
      backgroundDismiss: 'true',
      autoClose: 'no|10000',
      buttons: {
        no: {
          text: 'НЕ',
          btnClass: 'btn-white-rgz',
          keys: ['esc'],
          action: function() {}
        },
        yes: {
          text: 'ДА',
          btnClass: 'btn-white-rgz',
          keys: ['enter'],
          action: function() {
            location.reload();
          }
        }
      }
    });
  };

  global.$RGZ = RGZ;
})(window);