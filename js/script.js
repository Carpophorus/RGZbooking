(function(global) {
  RGZ = {};

  RGZ.ssTokenLabel = 'RGZtoken';
  RGZ.bearer = '';
  RGZ.loginInfo = '';

  //DBS TEST
  //RGZ.apiRoot = 'http://10.0.13.9:8083/api/';
  //RGZ.apiRoot = 'http://10.0.1.251:8083/api/';
  RGZ.apiRoot = 'http://localhost:50398/api/';

  //RGZ LIVE
  //RGZ.apiRoot = 'http://93.87.56.76:8083/api/';

  RGZ.salteriSluzbe = '';
  RGZ.zahtevi = '';
  RGZ.kancelarijeSluzbe = '';
  RGZ.salteriTermini = '';
  RGZ.kancelarijeTermini = '';
  RGZ.zakazaniTermini = [];
  RGZ.statusSluzbe = '';

  RGZ.adminRole = '';
  RGZ.adminSluzbe = '';
  RGZ.adminPraznici = '';
  RGZ.adminDokumenti = '';
  RGZ.checkboxLabelLinkClicked = false;
  RGZ.fellowCraft = 1700;

  RGZ.razloziOtkazivanja = [];

  var bookingForbidden = false;
  var nav = 0;
  var confirmArrivalClicked = false;
  var fetchCounterTimesClicked = false;
  var fetchOfficeTimesClicked = false;
  var dep = '';
  var off = '';
  var scheduleDate = '';
  var date = new Date();
  var day = ((date.getDate() < 10) ? "0" : "") + date.getDate();
  var month = ((date.getMonth() + 1 < 10) ? "0" : "") + (date.getMonth() + 1);
  var year = date.getFullYear();
  var scheduleDateAux = ("" + year + "-" + month + "-" + day);

  var counterDescViewed = false;
  var officeDescViewed = false;
  var statusDescViewed = false;

  var svSluzbe = null;
  var novaSKN = 0;
  var otkazRazlog = 0;

  var insertHtml = function(selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  window.appear = function(selector, interval) {
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

  window.disappear = function(selector, interval) {
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
    if ($("#book-content").length > 0) {
      var tokens = JSON.parse(sessionStorage.getItem(RGZ.ssTokenLabel));
      RGZ.bearer = (tokens != null) ? tokens.access_token : "";
      appear($("#book-content>.content-box-loader"), 200);
      var sync = 4;
      $ajaxUtils.sendGetRequest(
        RGZ.apiRoot + "salteri/sluzbe",
        function(responseArray, status) {
          RGZ.salteriSluzbe = responseArray;
          sync = sync - 1;
          if (sync == 0) RGZ.loadBookContent();
        },
        true /*, RGZ.bearer*/
      );
      $ajaxUtils.sendGetRequest(
        RGZ.apiRoot + "salteri/zahtevi",
        function(responseArray, status) {
          RGZ.zahtevi = responseArray;
          sync = sync - 1;
          if (sync == 0) RGZ.loadBookContent();
        },
        true /*, RGZ.bearer*/
      );
      $ajaxUtils.sendGetRequest(
        RGZ.apiRoot + "kancelarije/sluzbe",
        function(responseArray, status) {
          RGZ.kancelarijeSluzbe = responseArray;
          sync = sync - 1;
          if (sync == 0) RGZ.loadBookContent();
        },
        true /*, RGZ.bearer*/
      );
      $ajaxUtils.sendGetRequest(
        RGZ.apiRoot + "status/sluzbe",
        function(responseArray, status) {
          RGZ.statusSluzbe = responseArray;
          sync = sync - 1;
          if (sync == 0) RGZ.loadBookContent();
        },
        true /*, RGZ.bearer*/
      );
      RGZ.footMouseOver();
      setTimeout(RGZ.footMouseOut, 2000);
    } else if ($(".schedule").length > 0 && sessionStorage.getItem(RGZ.ssTokenLabel) != null) {
      if (JSON.parse(sessionStorage.getItem(RGZ.ssTokenLabel)).rola < 3)
        location.pathname = location.pathname.replace('termini', 'admin');
      RGZ.scheduleAux();
    } else if ($(".admin").length > 0 && sessionStorage.getItem(RGZ.ssTokenLabel) != null) {
      if (JSON.parse(sessionStorage.getItem(RGZ.ssTokenLabel)).rola >= 3)
        location.pathname = location.pathname.replace('admin', 'termini');
      RGZ.adminAux();
    } else if (sessionStorage.getItem(RGZ.ssTokenLabel) == null) {
      appear($(".content-box-content"), 500);
      disappear($(".content-box-loader"), 200);
    }

    var today = new Date();
    var limit = new Date(2018, 9, 1);
    if (today < limit) {
      $.confirm({
        title: 'ОБАВЕШТЕЊЕ',
        content: 'Приликом заказивања састанка са службеником Катастра или вршења упита за статус предмета, у поље подвучено црвеном линијом могуће је уписати само БРОЈ (по старој класификацији) или БРОЈ-БРОЈ (по класификацији од јула 2018. године).<br><br><span>Ово обавештење ће се приказивати до 1. октобра 2018. године.</span>',
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
    }
  });

  RGZ.loadBookContent = function() {
    var bookHtml = `
      <div class="btn-group hidden-xs-down" data-toggle="buttons">
        <label class="btn btn-primary active" onclick="$RGZ.bookSwitch(0);">
          <input type="radio" name="options" id="option1" autocomplete="off" checked>ЗА&nbsp;ПРЕДАЈУ&nbsp;ЗАХТЕВА<br>НА&nbsp;ШАЛТЕРУ
        </label>
        <label class="btn btn-primary" onclick="$RGZ.bookSwitch(1);">
          <input type="radio" name="options" id="option2" autocomplete="off">ЗА&nbsp;САСТАНАК&nbsp;СА<br>СЛУЖБЕНИКОМ&nbsp;КАТАСТРА
        </label>
        <label class="btn btn-primary" onclick="$RGZ.bookSwitch(2);">
          <input type="radio" name="options" id="option3" autocomplete="off">ПРОВЕРА&nbsp;СТАТУСА<br>ВАШЕГ&nbsp;ПРЕДМЕТА
        </label>
      </div>
      <div class="btn-group hidden-sm-up" data-toggle="buttons">
        <label class="btn btn-primary active" onclick="$RGZ.bookSwitch(0);">
          <input type="radio" name="options" id="option1" autocomplete="off" checked>ЗА&nbsp;ПРЕДАЈУ&nbsp;ЗАХТЕВА<br>НА&nbsp;ШАЛТЕРУ
        </label>
        <label class="btn btn-primary" onclick="$RGZ.bookSwitch(1);">
          <input type="radio" name="options" id="option2" autocomplete="off">ЗА&nbsp;САСТАНАК&nbsp;СА<br>СЛУЖБЕНИКОМ
        </label>
        <label class="btn btn-primary" onclick="$RGZ.bookSwitch(2);">
          <input type="radio" name="options" id="option3" autocomplete="off">ПРОВЕРА&nbsp;СТАТУСА<br>ВАШЕГ&nbsp;ПРЕДМЕТА
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
          <select id="book-counter-reason" class="book-counter-reason-lighter" onchange="$RGZ.counterReasonChanged();">
            <option disabled value="0" selected hidden>врста захтева ✱</option>
    `;
    for (i = 0; i < RGZ.zahtevi.length; i++)
      bookHtml += `<option value="` + RGZ.zahtevi[i].id + `">` + RGZ.zahtevi[i].opis + `</option>`;
    bookHtml += `
          </select>
          <input type="email" id="book-counter-mail" placeholder="e-mail ✱" onfocus="this.placeholder=''" onblur="this.placeholder='e-mail ✱'">
          <input id="book-counter-phone" placeholder="телефон" onfocus="this.placeholder=''" onblur="this.placeholder='телефон'" maxlength="11" onkeyup="$RGZ.numbersOnly(this);" onkeydown="$RGZ.numbersOnly(this);">
          <div id="book-counter-check" onclick="$RGZ.checkboxClicked(this);"><i class="fa fa-square-o"></i></div>
          <label class="checkbox-label" onclick="$RGZ.checkboxClicked($('#book-counter-check'));">Потврђујем да предајем потпуну документацију за захтев и упис због којег заказујем термин за предају захтева. У случају кашњења или доношења непотпуне документације, пристајем да наредна странка буде услужена и/или да будем упућен/а на редован шалтер. Прихватам и ограничење да на шалтеру Службе нећу вршити измену или допуне поднете пријаве за заказивање и да ћу у случају потребе да захтев буде измењен/проширен бити упућен/а на редован шалтер. Слажем се да захтев буде одбијен на лицу места уколико немам правни основ за подношење истог.</label>
          <div class="form-button" onclick="$RGZ.bookCounter();">ЗАКАЖИ</div>
        </div>
      </div>
      <div id="book-offices" class="gone">
        <select id="office-select" onchange="$RGZ.officeDepartmentChanged();">
          <option disabled value="0" selected hidden>ИЗАБЕРИТЕ СЛУЖБУ...</option>
    `;
    for (i = 0; i < RGZ.kancelarijeSluzbe.length; i++)
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
            <div class="subj-2"><input id="subj-type" type="text" maxlength="3" onkeyup="$RGZ.numbersOnly(this);" onkeydown="$RGZ.numbersOnly(this);"></div>
            <div class="subj-3">-</div>
            <div class="subj-4"><input id="subj-id" type="text" maxlength="17"></div>
            <div class="subj-5">/</div>
            <div class="subj-6"><input id="subj-year" type="text" maxlength="4" onkeyup="$RGZ.numbersOnly(this);" onkeydown="$RGZ.numbersOnly(this);"></div>
          </div>
        </div>
        <div class="form-search-button-container"><div class="form-search-button" onclick="$RGZ.fetchOfficeTimes();">ПРЕТРАГА</div><div class="form-notice">НАПОМЕНА: Уколико желите да закажете састанак у вези предмета формираног 2013. године или раније, позовите Инфо Центар.</div></div>
        <select id="office-day-select" class="gone" onchange="$RGZ.bookOfficeDay();">
        </select>
        <select id="office-time-select" class="gone" onchange="$RGZ.bookOfficeTime();">
        </select>
        <div id="book-office-aux" class="aux-container gone">
          <input id="book-office-name" placeholder="име и презиме ✱" onfocus="this.placeholder=''" onblur="this.placeholder='име и презиме ✱'">
          <input type="email" id="book-office-mail" placeholder="e-mail ✱" onfocus="this.placeholder=''" onblur="this.placeholder='e-mail ✱'">
          <input id="book-office-phone" placeholder="телефон" onfocus="this.placeholder=''" onblur="this.placeholder='телефон'" maxlength="11" onkeyup="$RGZ.numbersOnly(this);" onkeydown="$RGZ.numbersOnly(this);">
          <div id="book-office-check" onclick="$RGZ.checkboxClicked(this);"><i class="fa fa-square-o"></i></div>
          <label class="checkbox-label" onclick="$RGZ.checkboxClicked($('#book-office-check'));">Потврђујем да предмет због којег заказујем састанак са службеником није архивиран (одн. завршен), нити да постоји претходни захтев. Такође потврђујем да сам претходно проверио/ла статус свог предмета <span onclick="$RGZ.checkboxLabelLinkClicked = true; $('.btn-group .btn-primary:last-child').click();">ОВДЕ</span>. Слажем се да мој захтев за информацијама о предмету буде одбијен уколико немам правни основ да исте затражим.</label>
          <div class="form-button" onclick="$RGZ.bookOffice();">ЗАКАЖИ</div>
        </div>
      </div>
      <div id="book-status" class="gone">
        <!-- <div class="message-overlay">
          <div class="message-container message-error">
            <i class="message-icon fa fa-wrench"></i>
            <div class="message-ct-container">
              <div class="message-code">У&nbsp;ИЗРАДИ</div>
              <div class="message-text">Тражена функционалност није тренутно доступна.</div>
            </div>
          </div>
        </div> -->
        <select id="status-dep-select">
          <option disabled value="-1" selected hidden>ИЗАБЕРИТЕ СЛУЖБУ...</option>
    `;
    for (i = 0; i < RGZ.statusSluzbe.length; i++)
      bookHtml += `<option value="` + RGZ.statusSluzbe[i].dms_sluzbaId + `">` + RGZ.statusSluzbe[i].sluzba + `</option>`;
    bookHtml += `
        </select>
        <div id="subj-select">
          <div class="subj-1">
            <span class="hidden-sm-down">БР.&nbsp;ПРЕДМЕТА:</span>
            <span class="hidden-md-up">БР.&nbsp;ПР.:</span>
            &nbsp;952&nbsp;-&nbsp;02&nbsp;-&nbsp;
          </div>
          <div class="subj-input-container">
            <div class="subj-2"><input id="subj-type" type="text" maxlength="3" onkeyup="disappear($('#book-status-aux'), 500); $RGZ.numbersOnly(this);" onkeydown="disappear($('#book-status-aux'), 500); $RGZ.numbersOnly(this);"></div>
            <div class="subj-3">-</div>
            <div class="subj-4"><input id="subj-id" type="text" maxlength="17" onkeyup="disappear($('#book-status-aux'), 500);" onkeydown="disappear($('#book-status-aux'), 500);"></div>
            <div class="subj-5">/</div>
            <div class="subj-6"><input id="subj-year" type="text" maxlength="4" onkeyup="disappear($('#book-status-aux'), 500); $RGZ.numbersOnly(this);" onkeydown="disappear($('#book-status-aux'), 500); $RGZ.numbersOnly(this);"></div>
          </div>
        </div>
        <!-- <input id="book-status-id" placeholder="идентификациони број" onfocus="this.placeholder=''" onblur="this.placeholder='идентификациони број'" onkeyup="disappear($('#book-status-aux'), 500); $RGZ.numbersOnly(this);" onkeydown="disappear($('#book-status-aux'), 500); $RGZ.numbersOnly(this);"> -->
        <div class="form-search-button-container"><div class="form-search-button" onclick="$RGZ.fetchStatus();">ПРЕТРАГА</div><div class="form-notice">НАПОМЕНА: Увид је омогућен за предмете формиране 2017. године и касније.</div></div>
        <div id="book-status-aux" class="aux-container gone">
          <div id="book-status-aux-title"></div>
          <div id="book-status-aux-desc"></div>
        </div>
      </div>
    `;
    insertHtml("#book-content>.content-box-content", bookHtml);
    disappear($(".content-box-loader"), 200);
    setTimeout(function() {
      appear($("#book-content>.content-box-content"), 500);
      if (!counterDescViewed)
        $.confirm({
          title: 'ЗАКАЗИВАЊЕ ШАЛТЕРСКОГ ТЕРМИНА',
          content: 'Овај део апликације еЗаказивање Вам помаже да закажете термин за предају захтева на шалтеру Катастра како бисте избегли гужве и чекање у редовима.<br><br><div style="width: 100%; text-align: left">&bull;&nbsp;Одаберите жељену Службу Катастра Непокретности и кликните на дугме ПРЕТРАГА.<br>&bull;&nbsp;Изаберите датум из падајуће листе, а потом и термин који би Вам највише одговарао.<br>&bull;&nbsp;Попуните форму са личним подацима, прихватите услове коришћења и кликните на дугме ЗАКАЖИ.<br>&bull;&nbsp;Сачекајте потврду заказаног термина од стране апликације. Примићете и e-mail потврде на адресу електронске поште коју сте оставили приликом попуњавања форме.</div>',
          theme: 'supervan',
          buttons: {
            ok: {
              text: 'ОК',
              btnClass: 'btn-white-rgz',
              keys: ['enter'],
              action: function() {
                counterDescViewed = true;
              }
            }
          }
        });
    }, 200);
  };

  $(window).resize(function() {
    if (window.innerWidth > 991.5) {
      if ($("#foot-mobile").hasClass("clicked")) $("#foot-mobile").click();
      $(".content-box").css({
        "height": "100%" /* "86vh" when footer is active */
      });
    } else {
      $(".content-box").css({
        "height": "100%" /* "84vh" when footer is active */
      });
    }
    if (!$("#book-offices").hasClass("gone"))
      $("#book-offices .subj-input-container").width($("#book-offices #subj-select").innerWidth() - $("#book-offices .subj-1").innerWidth());
    if (!$("#book-status").hasClass("gone"))
      $("#book-status .subj-input-container").width($("#book-status #subj-select").innerWidth() - $("#book-status .subj-1").innerWidth());
  });

  RGZ.recaptchaCallback = function(token) {
    var data;
    if (nav == 0) {
      data = RGZ.salteriTermini[$("#counter-time-select option:selected").attr("value")];
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
              print: {
                text: '<i class="fa fa-print"></i>',
                btnClass: 'btn-white-rgz hidden-md-down',
                action: function() {
                  var date = new Date();
                  var day = ((date.getDate() < 10) ? "0" : "") + date.getDate();
                  var month = ((date.getMonth() + 1 < 10) ? "0" : "") + (date.getMonth() + 1);
                  var year = date.getFullYear();
                  var hours = ((date.getHours() < 10) ? "0" : "") + date.getHours();
                  var minutes = ((date.getMinutes() < 10) ? "0" : "") + date.getMinutes();
                  var printTitle = "ЗАКАЗАНО " + day + `.` + month + `.` + year + `. ` + hours + `:` + minutes;
                  var html4print = `
                      <head><title>ЗАКАЗАНИ ТЕРМИН</title></head>
                      <body>
                        <div class="print-title">` + printTitle + `</div>
                        <div class="details">
                          ` + detailsText + `
                        </div>
                        <style>
                          body {
                            margin: 0;
                            -webkit-print-color-adjust: exact;
                          }
                          .details {
                            position: relative;
                            width: 100%;
                            font-size: 75%;
                            overflow: auto;
                          }
                          .print-title {
                            text-align: center;
                            font-size: 75%;
                            font-weight: 600;
                            padding: 20px;
                          }
                        </style>
                      </body>
                    `;

                  w = window.open("");
                  w.document.write(html4print);
                  w.print();
                  w.close();
                  RGZ.counterDepartmentChanged();
                  $("#book-counter-aux>input").val("");
                  $("#book-counter-reason").addClass("book-counter-reason-lighter");
                  $("#book-counter-aux>select option:selected").prop("selected", false);
                  $("#book-counter-aux>select option:first-child").prop("selected", true);
                  $("#book-counter-check>i").removeClass("fa-check-square-o").addClass("fa-square-o");
                }
              },
              ok: {
                text: 'ОК',
                btnClass: 'btn-white-rgz',
                keys: ['enter'],
                action: function() {
                  RGZ.counterDepartmentChanged();
                  $("#book-counter-aux>input").val("");
                  $("#book-counter-reason").addClass("book-counter-reason-lighter");
                  $("#book-counter-aux>select option:selected").prop("selected", false);
                  $("#book-counter-aux>select option:first-child").prop("selected", true);
                  $("#book-counter-check>i").removeClass("fa-check-square-o").addClass("fa-square-o");
                }
              }
            }
          });
        },
        true, data, ((RGZ.bearer != "") ? RGZ.bearer : undefined)
      );
    } else if (nav == 1) {
      data = RGZ.kancelarijeTermini[$("#office-time-select option:selected").attr("value")];
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
              print: {
                text: '<i class="fa fa-print"></i>',
                btnClass: 'btn-white-rgz hidden-md-down',
                action: function() {
                  var date = new Date();
                  var day = ((date.getDate() < 10) ? "0" : "") + date.getDate();
                  var month = ((date.getMonth() + 1 < 10) ? "0" : "") + (date.getMonth() + 1);
                  var year = date.getFullYear();
                  var hours = ((date.getHours() < 10) ? "0" : "") + date.getHours();
                  var minutes = ((date.getMinutes() < 10) ? "0" : "") + date.getMinutes();
                  var printTitle = "ЗАКАЗАНО " + day + `.` + month + `.` + year + `. ` + hours + `:` + minutes;
                  var html4print = `
                      <head><title>ЗАКАЗАНИ ТЕРМИН</title></head>
                      <body>
                        <div class="print-title">` + printTitle + `</div>
                        <div class="details">
                          ` + detailsText + `
                        </div>
                        <style>
                          body {
                            margin: 0;
                            -webkit-print-color-adjust: exact;
                          }
                          .details {
                            position: relative;
                            width: 100%;
                            font-size: 75%;
                            overflow: auto;
                          }
                          .print-title {
                            text-align: center;
                            font-size: 75%;
                            font-weight: 600;
                            padding: 20px;
                          }
                        </style>
                      </body>
                    `;

                  w = window.open("");
                  w.document.write(html4print);
                  w.print();
                  w.close();
                  RGZ.officeDepartmentChanged();
                  $("#book-office-aux>input").val("");
                  $("#book-office-aux>select option:selected").prop("selected", false);
                  $("#book-office-aux>select option:first-child").prop("selected", true);
                  $("#book-office-check>i").removeClass("fa-check-square-o").addClass("fa-square-o");
                }
              },
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
        true, data, ((RGZ.bearer != "") ? RGZ.bearer : undefined)
      );
    } else if (nav == 2) {
      $ajaxUtils.sendGetRequest(
        RGZ.apiRoot + "status/predmet" + "?brojPredmeta=" + encodeURIComponent("952-02-" + $("#book-status #subj-type").val() + "-" + $("#book-status #subj-id").val() + "/" + $("#book-status #subj-year").val()) + "&sluzbaId=" + $("#book-status #status-dep-select option:selected").attr("value") + "&captchaToken=" + encodeURIComponent(token),
        function(responseArray, status) {
          $("#book-status #subj-type, #book-status #subj-id, #book-status #subj-year, #book-status #status-dep-select").prop("disabled", false);
          insertHtml("#book-status-aux-title", responseArray.status);
          insertHtml("#book-status-aux-desc", responseArray.opis);
          disappear($(".content-box-loader"), 200);
          appear($("#book-status-aux"), 500);
        },
        true /*, RGZ.bearer */
      );
    }
  };

  RGZ.checkboxClicked = function(e) {
    if (RGZ.checkboxLabelLinkClicked == true) {
      RGZ.checkboxLabelLinkClicked = false;
      return;
    }
    if ($(e).find("i").hasClass("fa-square-o"))
      $(e).find("i").removeClass("fa-square-o").addClass("fa-check-square-o");
    else
      $(e).find("i").addClass("fa-square-o").removeClass("fa-check-square-o");
  };

  RGZ.bookSwitch = function(n) {
    if (n == 0 && nav != 0) {
      disappear($("#book-offices"), 500);
      disappear($("#book-status"), 500);
      setTimeout(function() {
        appear($("#book-counters"), 500);
      }, 510);
      nav = 0;
      if (!counterDescViewed)
        $.confirm({
          title: 'ЗАКАЗИВАЊЕ ШАЛТЕРСКОГ ТЕРМИНА',
          content: 'Овај део апликације еЗаказивање Вам помаже да закажете термин за предају захтева на шалтеру Катастра како бисте избегли гужве и чекање у редовима.<br><br><div style="width: 100%; text-align: left">&bull;&nbsp;Одаберите жељену Службу Катастра Непокретности и кликните на дугме ПРЕТРАГА.<br>&bull;&nbsp;Изаберите датум из падајуће листе, а потом и термин који би Вам највише одговарао.<br>&bull;&nbsp;Попуните форму са личним подацима, прихватите услове коришћења и кликните на дугме ЗАКАЖИ.<br>&bull;&nbsp;Сачекајте потврду заказаног термина од стране апликације. Примићете и e-mail потврде на адресу електронске поште коју сте оставили приликом попуњавања форме.</div>',
          theme: 'supervan',
          buttons: {
            ok: {
              text: 'ОК',
              btnClass: 'btn-white-rgz',
              keys: ['enter'],
              action: function() {
                counterDescViewed = true;
              }
            }
          }
        });
    }
    if (n == 1 && nav != 1) {
      disappear($("#book-counters"), 500);
      disappear($("#book-status"), 500);
      setTimeout(function() {
        appear($("#book-offices"), 500);
        $("#book-offices .subj-input-container").width($("#book-offices #subj-select").innerWidth() - $("#book-offices .subj-1").innerWidth());
      }, 510);
      nav = 1;
      if (!officeDescViewed)
        $.confirm({
          title: 'ЗАКАЗИВАЊЕ КАНЦЕЛАРИЈСКОГ ТЕРМИНА',
          content: 'Овај део апликације еЗаказивање Вам помаже да закажете термин са службеником за геодетске или правне послове у оквиру одређене Службе Катастра Непокретности, ради увида у постојећи предмет.<br><br><div style="width: 100%; text-align: left">&bull;&nbsp;Одаберите жељену Службу Катастра Непокретности и упишите број Вашег предмета (поље подвучено црвеном линијом прихвата податке у формату "nnnn" или "sss-nnnn", где је "nnnn" број предмета, а "sss" број Службе по новој класификацији). Потом, кликните на дугме ПРЕТРАГА.<br>&bull;&nbsp;Изаберите датум из падајуће листе, а потом и термин који би Вам највише одговарао.<br>&bull;&nbsp;Попуните форму са личним подацима, прихватите услове коришћења и кликните на дугме ЗАКАЖИ.<br>&bull;&nbsp;Сачекајте потврду заказаног термина од стране апликације. Примићете и e-mail потврде на адресу електронске поште коју сте оставили приликом попуњавања форме.</div>',
          theme: 'supervan',
          buttons: {
            ok: {
              text: 'ОК',
              btnClass: 'btn-white-rgz',
              keys: ['enter'],
              action: function() {
                officeDescViewed = true;
              }
            }
          }
        });
    }
    if (n == 2 && nav != 2) {
      disappear($("#book-counters"), 500);
      disappear($("#book-offices"), 500);
      setTimeout(function() {
        appear($("#book-status"), 500);
        $("#book-status .subj-input-container").width($("#book-status #subj-select").innerWidth() - $("#book-status .subj-1").innerWidth());
      }, 510);
      nav = 2;
      if (!statusDescViewed)
        $.confirm({
          title: 'УВИД У СТАТУС ПРЕДМЕТА',
          content: 'Овај део апликације еЗаказивање Вам помаже да видите статус свог предмета, без потребе да долазите до одговарајуће Службе Катастра Непокретности или да зовете Инфо Центар.<br><br><div style="width: 100%; text-align: left">&bull;&nbsp;Одаберите жељену Службу Катастра Непокретности и упишите број Вашег предмета (поље подвучено црвеном линијом прихвата податке у формату "nnnn" или "sss-nnnn", где је "nnnn" број предмета, а "sss" број Службе по новој класификацији). Потом, кликните на дугме ПРЕТРАГА.<br>&bull;&nbsp;Радни назив статуса Вашег предмета ће се приказати након провере података.</div>',
          theme: 'supervan',
          buttons: {
            ok: {
              text: 'ОК',
              btnClass: 'btn-white-rgz',
              keys: ['enter'],
              action: function() {
                statusDescViewed = true;
              }
            }
          }
        });
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
    }, 500);
    disappear($("#counter-day-select, #counter-time-select, #book-counter-aux"), 500);
    $(".content-box-content").animate({
      scrollTop: 0
    }, 500);
  };

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
    }, 500);
    disappear($("#office-day-select, #office-time-select, #book-office-aux"), 500);
    $(".content-box-content").animate({
      scrollTop: 0
    }, 500);
  };

  RGZ.counterReasonChanged = function() {
    $("#book-counter-reason").removeClass("book-counter-reason-lighter");
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
    disappear($("#counter-time-select, #counter-day-select, #book-counter-aux"), 500);
    $(".content-box-content").animate({
      scrollTop: 0
    }, 500);
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
          for (i = 0; i < datumi.length; i++) {
            var localizedDate = datumi[i].substring(8, 10) + '.' + datumi[i].substring(5, 7) + '.' + datumi[i].substring(0, 4) + '.';
            selectDayHtml += `<option value="` + datumi[i] + `">` + localizedDate + `</option>`;
          }
          insertHtml("#counter-day-select", selectDayHtml);
          var selectTimeHtml = `
            <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ТЕРМИН...</option>
            <option disabled value="0">ПРВО ИЗАБЕРИТЕ ДАТУМ</option>
          `;
          insertHtml("#counter-time-select", selectTimeHtml);
          if (RGZ.salteriTermini.length > 0)
            appear($("#counter-time-select, #counter-day-select"), 500);
          else
            $.confirm({
              title: 'ОБАВЕШТЕЊЕ',
              content: 'Сви термини у одабраној служби су заузети, молимо покушајте касније.',
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
          disappear($(".content-box-loader"), 200);
          $("#counter-select").prop("disabled", false);
        },
        true /*, RGZ.bearer*/
      );
    }, 500);
  };

  RGZ.fetchOfficeTimes = function() {
    fetchOfficeTimesClicked = true;
    if ($("#office-select option:selected").val() == 0 || $("#book-offices #subj-type").val() == "" || $("#book-offices #subj-id").val() == "" || $("#book-offices #subj-year").val() == "") {
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
    if ($("#book-offices #subj-year").val().length < 4) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Морате уписати четвороцифрену годину у последњем пољу броја предмета.',
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
    if (RGZ.bearer == "" || RGZ.bearer == undefined) {
      var regex1 = RegExp(/^\d+\-?(?:\d+)?$/g);
      if (!regex1.test($("#book-offices #subj-id").val())) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Поље подвучено црвеном бојом прихвата формат БРОЈ или БРОЈ-БРОЈ.<br><br><span>Молимо уклоните сва слова, специјалне карактере и размаке.</span>',
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
      /*var regex2 = RegExp(/^\d+\-\d+$/g);
      if (regex2.test($("#book-offices #subj-id").val())) {
        if (Number($("#book-offices #subj-id").val().substring(0, $("#book-offices #subj-id").val().indexOf('-'))) != Number($("#office-select option:selected").val())) {
          $.confirm({
            title: 'ГРЕШКА!',
            content: 'Не можете заказати састанак у вези предмета који није заведен у одабраној служби.</span>',
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
      }*/
      if (($("#book-offices #subj-type").val() < 1 || $("#book-offices #subj-type").val() > 21) /*&& $("#office-select option:selected").val() != RGZ.fellowCraft*/) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Класификациони број предмета (број који уписујете у прво поље слева) мора бити у опсегу од 1 до 21. Не можете заказати увид за другостепене предмете.<br><br><span>Уколико желите да закажете састанак у вези предмета формираног 2013. године или раније, позовите Инфо Центар.</span>',
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
      /*
      if (!($("#book-offices #subj-type").val() == 22 || $("#book-offices #subj-type").val() == 23) && $("#office-select option:selected").val() == RGZ.fellowCraft) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Класификациони број предмета (број који уписујете у прво поље слева) за другостепени поступак је 22 или 23.<br><br><span>Уколико желите да закажете састанак у вези предмета формираног 2013. године или раније, позовите Инфо Центар.</span>',
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
      */
      if ($("#book-offices #subj-year").val() < 2014) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Можете заказати термин само за предмете који су формирани 2014. године и касније.<br><br><span>Уколико желите да закажете састанак у вези предмета формираног 2013. године или раније, позовите Инфо Центар.</span>',
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
      if ($("#book-offices #subj-year").val() > (new Date()).getFullYear()) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Не можете заказати термин за предмет из будућности.',
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
      if ($("#book-offices #subj-id").val() <= 0) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Број предмета не може бити 0 или мањи.',
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
    }
    $("#office-select, #book-offices #subj-type, #book-offices #subj-id, #book-offices #subj-year").prop("disabled", true);
    $(".content-box-loader").css({
      "padding-top": "56vh"
    });
    appear($(".content-box-loader"), 200);
    disappear($("#office-time-select, #office-day-select, #book-office-aux"), 500);
    $(".content-box-content").animate({
      scrollTop: 0
    }, 500);
    RGZ.officeDepartmentChanged();
    setTimeout(function() {
      $ajaxUtils.sendGetRequest(
        RGZ.apiRoot + "kancelarije/termini" + "?sluzbaId=" + $("#office-select option:selected").attr("value") + "&broj_dok=" + encodeURIComponent("952-02-" + $("#book-offices #subj-type").val() + "-" + $("#book-offices #subj-id").val() + "/" + $("#book-offices #subj-year").val()),
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
          for (i = 0; i < datumi.length; i++) {
            var localizedDate = datumi[i].substring(8, 10) + '.' + datumi[i].substring(5, 7) + '.' + datumi[i].substring(0, 4) + '.';
            selectDayHtml += `<option value="` + datumi[i] + `">` + localizedDate + `</option>`;
          }
          insertHtml("#office-day-select", selectDayHtml);
          var selectTimeHtml = `
            <option disabled value="0" selected hidden>ИЗАБЕРИТЕ ТЕРМИН...</option>
            <option disabled value="0">ПРВО ИЗАБЕРИТЕ ДАТУМ</option>
          `;
          insertHtml("#office-time-select", selectTimeHtml);
          if (RGZ.kancelarijeTermini.length > 0)
            appear($("#office-time-select, #office-day-select"), 500);
          else
            $.confirm({
              title: 'ОБАВЕШТЕЊЕ',
              content: 'Сви термини у одабраној служби су заузети, молимо покушајте касније.',
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
          disappear($(".content-box-loader"), 200);
          $("#office-select, #book-offices #subj-type, #book-offices #subj-id, #book-offices #subj-year").prop("disabled", false);
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
      scrollTop: $("#book-counter-aux").offset().top - $(".btn-group").offset().top + 10 * window.innerHeight / 100
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
      scrollTop: $("#book-office-aux").offset().top - $(".btn-group").offset().top + 10 * window.innerHeight / 100
    }, 1500);
    setTimeout(function() {
      appear($("#book-office-aux"), 1000);
    }, 10);
  };

  RGZ.numbersOnly = function(e) {
    $(e).val($(e).val().replace(/\D/g, ''));
    if ($(e).attr("id") == "subj-type" || $(e).attr("id") == "subj-year")
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
    if ($("#book-counter-name").val() == "" || $("#book-counter-reason option:selected").attr("value") == 0 || $("#book-counter-mail").val() == "" || document.getElementById('book-counter-mail').checkValidity() == false || $("#book-counter-check i").hasClass("fa-square-o")) {
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
    /*if ($("#book-counter-mail").val() != "") {
      var mail = $("#book-counter-mail").val();
      if (!(~mail.lastIndexOf("@") && ~mail.lastIndexOf(".") && mail.lastIndexOf("@") < mail.lastIndexOf("."))) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Ваша адреса електронске поште није у одговарајућем формату.',
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
    }*/
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
        }
      }
    });
  };

  RGZ.bookOffice = function() {
    if (bookingForbidden == true) return;
    if ($("#book-office-name").val() == "" || $("#book-office-mail").val() == "" || document.getElementById('book-office-mail').checkValidity() == false || $("#book-office-check i").hasClass("fa-square-o")) {
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
    /*if ($("#book-office-mail").val() != "") {
      var mail = $("#book-office-mail").val();
      if (!(~mail.lastIndexOf("@") && ~mail.lastIndexOf(".") && mail.lastIndexOf("@") < mail.lastIndexOf("."))) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Ваша адреса електронске поште није у одговарајућем формату.',
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
    }*/
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
        }
      }
    });
  };

  RGZ.fetchStatus = function() {
    if ($("#book-status #subj-type").val() == "" || $("#book-status #subj-id").val() == "" || $("#book-status #subj-year").val() == "" || $("#book-status #status-dep-select option:selected").attr("value") == -1 /*|| $("#book-status #book-status-id").val() == ""*/ ) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Морате одабрати службу у којој је предмет заведен и исправно попунити број предмета.' /*и идентификациони број, уколико је везан за Ваш предмет.'*/ ,
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
    if ($("#book-status #subj-year").val().length < 4) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Морате уписати четвороцифрену годину у последњем пољу броја предмета.',
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
    if (RGZ.bearer == "" || RGZ.bearer == undefined) {
      var regex1 = RegExp(/^\d+\-?(?:\d+)?$/g);
      if (!regex1.test($("#book-status #subj-id").val())) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Поље подвучено црвеном бојом прихвата формат БРОЈ или БРОЈ-БРОЈ.<br><br><span>Молимо уклоните сва слова, специјалне карактере и размаке.</span>',
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
      /*var regex2 = RegExp(/^\d+\-\d+$/g);
      if (regex2.test($("#book-status #subj-id").val())) {
        if (Number($("#book-status #subj-id").val().substring(0, $("#book-status #subj-id").val().indexOf('-'))) != Number($("#book-status #status-dep-select option:selected").attr("value"))) {
          $.confirm({
            title: 'ГРЕШКА!',
            content: 'Не можете видети статус предмета који није заведен у одабраној служби.</span>',
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
      }*/
      if (($("#book-status #subj-type").val() < 1 || $("#book-status #subj-type").val() > 21) /*&& $("#book-status #status-dep-select option:selected").attr("value") != RGZ.fellowCraft*/) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Класификациони број предмета (број који уписујете у прво поље слева) мора бити у опсегу од 1 до 21.',
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
      /*
      if (!($("#book-status #subj-type").val() == 22 || $("#book-status #subj-type").val() == 23) && $("#book-status #status-dep-select option:selected").attr("value") == RGZ.fellowCraft) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Класификациони број предмета (број који уписујете у прво поље слева) за другостепени поступак је 22 или 23.<br><br><span>Уколико имате проблема са увидом у статус другостепеног предмета, позовите Инфо Центар.</span>',
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
      */
      if ($("#book-status #subj-year").val() < 2017) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Можете видети статус само за предмете који су формирани 2017. године и касније.',
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
      if ($("#book-status #subj-year").val() > (new Date()).getFullYear()) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Не можете видети статус за предмет из будућности.',
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
      if ($("#book-status #subj-id").val() <= 0) {
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Број предмета не може бити 0 или мањи.',
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
    }
    $("#book-status #subj-type, #book-status #subj-id, #book-status #subj-year, #book-status #status-dep-select").prop("disabled", true);
    $(".content-box-loader").css({
      "padding-top": "56vh" /*"67" for DEP+NUM+ID, "56vh" for NUM+ID, "45vh" for NUM */
    });
    disappear($("#book-status-aux"), 500);
    appear($(".content-box-loader"), 200);
    setTimeout(function() {
      grecaptcha.reset();
      grecaptcha.execute();
    }, 500);
  };

  RGZ.forgotPassword = function() {
    if ($("#username").val() == "") {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Морате унети корисничко име за налог којем се ресетује шифра.',
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
      content: 'Да ли сте сигурни да желите да ресетујете шифру за налог са корисничким именом "' + $("#username").val() + '"?<br><br><span>Нова шифра ће бити послата на одговарајућу e-mail адресу.</span>',
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
              RGZ.apiRoot + "korisnici/resetujSifru" + "?korisnik=" + $("#username").val(),
              function(responseArray, status) {
                $(".jconfirm").remove();
                $.confirm({
                  title: 'ЛОЗИНКА РЕСЕТОВАНА',
                  content: 'Лозинка за налог са корисничким именом "' + $("#username").val() + '" успешно је промењена.<br><br><span>Користите нову лозинку приликом наредне пријаве на систем путем овог налога.</span>',
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
              },
              true /*, RGZ.bearer*/
            );
          }
        }
      }
    });
  };

  calDataFetchedAux = function() {
    var qualified = [];
    for (var i = 0; i < RGZ.zakazaniTermini.length; i++) {
      if (RGZ.zakazaniTermini[i].salter != undefined) {
        if (!qualified.includes(RGZ.zakazaniTermini[i].salter))
          qualified.push(RGZ.zakazaniTermini[i].salter);
      } else {
        if (!qualified.includes(RGZ.zakazaniTermini[i].kancelarija))
          qualified.push(RGZ.zakazaniTermini[i].kancelarija);
      }
    }
    var scheduleContentHtml = `
      <option disabled selected hidden>ИЗАБЕРИТЕ ШАЛТЕР/КАНЦЕЛАРИЈУ...</option>
    `;
    for (i = 0; i < qualified.length; i++)
      scheduleContentHtml += `<option>` + qualified[i] + `</option>`;
    if (qualified.length == 0)
      scheduleContentHtml += `<option disabled>НЕМА ЗАКАЗАНИХ ТЕРМИНА</option>`;
    insertHtml("#schedule-co", scheduleContentHtml);
  };

  RGZ.sknSwitchSwitched = function() {
    novaSKN = $('#skn-switch-select option:selected').val();
  };

  RGZ.switchSKN = function() {
    novaSKN = 0;
    var switchHtml = `
      <select id="skn-switch-select" onchange="$RGZ.sknSwitchSwitched();">
        <option disabled value="0" selected hidden>ИЗАБЕРИТЕ СЛУЖБУ...</option>
    `;
    for (var i = 0; i < svSluzbe.length; i++)
      if (svSluzbe[i].id != 1  && svSluzbe[i].id != 172 && svSluzbe[i].id != RGZ.loginInfo.sluzbaId)
        switchHtml += `<option value="` + svSluzbe[i].id + `">` + svSluzbe[i].sluzba + `</option>`;
    switchHtml += `
      </select>
    `;
    $.confirm({
      title: 'ПРОМЕНА СКН',
      content: 'Овим вршите промену СКН која се користи за претрагу термина.<br><br>Тренутна СКН:<br><strong>' + RGZ.loginInfo.sluzba + '</strong><br><br>Нова СКН:<br>' + switchHtml,
      theme: 'supervan',
      backgroundDismiss: 'true',
      buttons: {
        cancel: {
          text: 'ОДУСТАНИ',
          btnClass: 'btn-white-rgz',
          keys: ['esc'],
          action: function() {}
        },
        ok: {
          text: 'ПРОМЕНИ',
          btnClass: 'btn-white-rgz',
          keys: ['enter'],
          action: function() {
            if (novaSKN == 0)
              $.confirm({
                title: 'ГРЕШКА!',
                content: 'Морате да одаберете нову СКН.',
                theme: 'supervan',
                backgroundDismiss: 'true',
                buttons: {
                  ok: {
                    text: 'ОК',
                    btnClass: 'btn-white-rgz',
                    keys: ['enter'],
                    action: function() {
                      RGZ.switchSKN();
                    }
                  }
                }
              });
            else {
              pleaseWait();
              $ajaxUtils.sendPutRequest(
                RGZ.apiRoot + "korisnici/izmeniSKN" + "?idSKN=" + novaSKN,
                function(responseArray, status) {
                  $(".jconfirm").remove();
                  sessionStorage.removeItem(RGZ.ssTokenLabel);
                  $.confirm({
                    title: 'СКН ПРОМЕЊЕНА',
                    content: 'Успешно сте променили СКН за претрагу.<br><br>Управо сте одјављени са апликације. Пријавите се поново са истим креденцијалима како би Вам измене биле видљиве.',
                    theme: 'supervan',
                    buttons: {
                      ok: {
                        text: 'ОК',
                        btnClass: 'btn-white-rgz',
                        keys: ['enter'],
                        action: function() {
                          location.reload();
                        }
                      }
                    }
                  });
                },
                true, RGZ.bearer
              );
            }
          }
        }
      }
    });
  };

  RGZ.scheduleSearchPopup = function() {
    //funkcija u ravoju
    //return
    var html = `
      <div id="schedule-search-popup" class="gone">
        <div id="schedule-search-popup-inner">
          <div id="schedule-search-popup-close" onclick="$RGZ.closeScheduleSearchPopup();"><i class="fa fa-times"></i></div>
          <div id="schedule-search-searchbar">
            <div id="schedule-search-searchbar-inner" class="row">
              <div class="col-3"><input id="schedule-search-searchbar-datefrom"></div>
              <div class="col-3"><input id="schedule-search-searchbar-dateto"></div>
              <div class="col-6"><input id="schedule-search-searchbar-searchterm"></div>
            </div>
            <div id="schedule-search-searchbar-searchbutton" onclick="$RGZ.scheduleSearchPopupSearch();"><i class="fa fa-search"></i></div>
          </div>
          <div id="searchtable" class="gone"></div>
        </div>
      </div>
    `;
    insertHtml(".schedule", html);
    //init datepickers
    appear($("#schedule-search-popup"), 500);
  };

  RGZ.closeScheduleSearchPopup = function() {
    disappear($("#schedule-search-popup"), 500);
    setTimeout(function() {
      $("#schedule-search-popup").remove();
    }, 510);
  }

  RGZ.scheduleSearchPopupSearch = function() {
    //vvvvvv
    //pleaseWait();
    //api call
    //on success until }:
      //$(".jconfirm").remove();
      //jconfirm number of results?
    var html = `.`; //table header?
    html += `.`;
    html += `.`;
    html += `.`;
    html += `.`;
    //red horizontal rows for future/today/past?
    insertHtml("#searchtable", html);
    appear($("#searchtable"), 500);
  }

  var updateTableOddity = function() {
    $('.schedule-item').removeClass('odd').removeClass('even');
    var items = $('.schedule-item').not('.zero-height');
    for (var iii = 0; iii < items.length; iii++)
      $(items[iii]).addClass((iii % 2 == 0) ? 'odd' : 'even');
  }

  RGZ.scheduleFilter = function(e) {
    $(e).toggleClass("active");
    if ($(e).hasClass("active"))
      $(".item-c.arrival").parent().toggleClass("zero-height", false);
    else {
      $(".item-c.arrival").parent().toggleClass("zero-height", true);
      if ($(".item-c.arrival").parent().hasClass("expanded")) {
        $(".schedule-item").removeClass("expanded");
        $(".expansion").collapse('hide');
      }
    }
    setTimeout(function() {
      updateTableOddity();
    }, 10);
  }

  dataFetchedAux = function() {
    var qualified = [];
    for (var i = 0; i < RGZ.zakazaniTermini.length; i++) {
      if (RGZ.zakazaniTermini[i].salter != undefined) {
        if (!qualified.includes(RGZ.zakazaniTermini[i].salter))
          qualified.push(RGZ.zakazaniTermini[i].salter);
      } else {
        if (!qualified.includes(RGZ.zakazaniTermini[i].kancelarija))
          qualified.push(RGZ.zakazaniTermini[i].kancelarija);
      }
    }
    var scheduleContentHtml = `
      ` //+ <div id="schedule-print` + ((RGZ.loginInfo.rola == 7) ? `-2` : ((RGZ.loginInfo.rola == 6) ? `-1` : ``)) + `" class="schedule-navi-button hidden-md-down gone" onclick="$RGZ.schedulePrint();"><i class="fa fa-print"></i></div>`
      + ((RGZ.loginInfo.rola == 7) ? `<div id="schedule-switch-skn" class="schedule-navi-button" onclick="$RGZ.switchSKN();"><strong>СКН</strong></div>` : ``)
      + ((RGZ.loginInfo.rola == 6 || RGZ.loginInfo.rola == 7) ? `<div id="schedule-search" class="schedule-navi-button" onclick="$RGZ.scheduleSearchPopup();"><i class="fa fa-search"></i></div>` : ``)
      + `<div id="schedule-filter" class="schedule-navi-button" onclick="$RGZ.scheduleFilter(this);"><i class="fa fa-filter"></i></div>`
      + `<div id="schedule-refresh" class="schedule-navi-button" onclick="$RGZ.scheduleRefresh(false);"><i class="fa fa-refresh"></i></div>
      <div id="schedule-password-change" class="schedule-navi-button" onclick="$RGZ.schedulePasswordChange();"><i class="fa fa-key"></i></div>
      <div id="logout" class="schedule-navi-button" onclick="$RGZ.logout();"><i class="fa fa-sign-out"></i></div>
      <div id="schedule-searchbar" class="row">
        <div class="col-lg-3 hidden-md-down"></div>
        <div class="col-12 col-lg-6">
          <div id="schedule-cal" class="` + ((RGZ.loginInfo.rola > 3) ? "" : "gone") + `" onclick="$('#schedule-cal-input').focus();">
            <i class="fa fa-calendar"></i>
            <input id="schedule-cal-input">
          </div>
          <select id="schedule-co" onchange="$RGZ.scheduleSearch();" style="` + ((RGZ.loginInfo.rola > 3) ? "width: calc(100% - 8vh)" : "") + `">
            <option disabled selected hidden>ИЗАБЕРИТЕ ШАЛТЕР/КАНЦЕЛАРИЈУ...</option>
    `;
    for (i = 0; i < qualified.length; i++)
      scheduleContentHtml += `<option>` + qualified[i] + `</option>`;
    scheduleContentHtml += `
          </select>
        </div>
        <div class="col-lg-3 hidden-md-down"></div>
      </div>
      <div id="timetable" class="gone"></div>
    `;
    insertHtml("#schedule-content .content-box-content", scheduleContentHtml);
    $("#schedule-cal-input").datepicker({
      format: "dd.mm.yyyy.",
      autoclose: true,
      todayBtn: true,
      todayHighlight: true,
      language: "sr",
      startDate: "12.03.2018.",
      daysOfWeekDisabled: [0, 6]
    }).on("show", function() {
      scheduleDate = $("#schedule-cal-input").val();
    }).on("hide", function() {
      if (scheduleDate != $("#schedule-cal-input").val()) {
        scheduleDateAux = scheduleDate = $("#schedule-cal-input").val().substring(6, 10) + "-" + $("#schedule-cal-input").val().substring(3, 5) + "-" + $("#schedule-cal-input").val().substring(0, 2);
        RGZ.zakazaniTermini = [];
        var date = new Date();
        var day = ((date.getDate() < 10) ? "0" : "") + date.getDate();
        var month = ((date.getMonth() + 1 < 10) ? "0" : "") + (date.getMonth() + 1);
        var year = date.getFullYear();
        var sync = 2; //(("" + year + "-" + month + "-" + day) == scheduleDateAux) ? 2 : 1;
        //if (("" + year + "-" + month + "-" + day) == scheduleDateAux)
          $ajaxUtils.sendGetRequest(
            RGZ.apiRoot + "korisnici/zakazaniTermini" + "?datum=" + encodeURIComponent(scheduleDateAux),
            function(responseArray, status) {
              for (var m = 0; m < responseArray.length; m++) {
                responseArray[m]["isOffice"] = false;
                RGZ.zakazaniTermini.push(responseArray[m]);
              }
              sync = sync - 1;
              if (sync == 0)
                calDataFetchedAux();
            },
            true, RGZ.bearer
          );
        $ajaxUtils.sendGetRequest(
          RGZ.apiRoot + "korisnici/zakazaniTerminiKancelarije" + "?datum=" + encodeURIComponent(scheduleDateAux),
          function(responseArray, status) {
            for (var n = 0; n < responseArray.length; n++) {
              responseArray[n]["isOffice"] = true;
              RGZ.zakazaniTermini.push(responseArray[n]);
            }
            sync = sync - 1;
            if (sync == 0)
              calDataFetchedAux();
          },
          true, RGZ.bearer
        );
      }
    });
    setTimeout(function() {
      appear($(".content-box-content"), 500);
      disappear($(".content-box-loader"), 200);
      disappear($("#navi-landing"), 500);
      setTimeout(function() {
        RGZ.scheduleRefresh(true);
      }, 600000);
    }, 500);
  };

  RGZ.editDep = function() {
    if ($("#dep-name").val() == "" || $("#dep-address").val() == "" || $("#dep-dms").val() == "" || $("#dep-start").val() == "" || $("#dep-end").val() == "" || $("#dep-int").val() == "") {
      inputMissing();
      return;
    }
    if ($("#dep-start").val() >= $("#dep-end").val()) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Време почетка и време краја радног времена нису у одговарајућем поретку.',
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
    var data = JSON.parse('{"id": "' + $("#admin-dep option:selected").val() + '", "sluzba": "' + $("#dep-name").val() + '", "adresa": "' + $("#dep-address").val() + '", "pocetak_radnog_vremena": "' + $("#dep-start").val() + '", "kraj_radnog_vremena": "' + $("#dep-end").val() + '", "interval_za_saltere": "' + $("#dep-int").val() + '", "dms_sluzbaId": "' + $("#dep-dms").val() + '"}');
    data = JSON.stringify(data);
    pleaseWait();
    $ajaxUtils.sendPutRequestWithData(
      RGZ.apiRoot + "admin/izmeniSluzbu" + "/" + $("#admin-dep option:selected").val(),
      function(responseArray, status) {
        $ajaxUtils.sendGetRequest(
          RGZ.apiRoot + "admin/sluzbe",
          function(responseArray, status) {
            RGZ.adminSluzbe = responseArray;
            $(".jconfirm").remove();
            confirmSuccess();
            $("#admin-dep option:selected").html($("#dep-name").val());
          },
          true, RGZ.bearer
        );
      },
      true, data, RGZ.bearer
    );
  };

  RGZ.newCnt = function() {
    if ($("#cnt-name").val() == "") {
      inputMissing();
      return;
    }
    var data = JSON.parse('{"id": "33", "opis": "' + $("#cnt-name").val() + '", "sluzbaId": "' + $("#admin-dep option:selected").val() + '", "aktivan": "true"}');
    data = JSON.stringify(data);
    pleaseWait();
    $ajaxUtils.sendPostRequestWithData(
      RGZ.apiRoot + "admin/novisalter",
      function(responseArray, status) {
        $ajaxUtils.sendGetRequest(
          RGZ.apiRoot + "admin/sluzbe",
          function(responseArray, status) {
            RGZ.adminSluzbe = responseArray;
            $(".jconfirm").remove();
            confirmSuccess();
          },
          true, RGZ.bearer
        );
      },
      true, data, RGZ.bearer
    );
  };

  RGZ.adminCntChanged = function() {
    var cnt = '';
    for (var i = 0; i < dep.rgz_salteri.length; i++) {
      if ($("#admin-cnt option:selected").val() == dep.rgz_salteri[i].id) {
        cnt = dep.rgz_salteri[i];
        break;
      }
    }
    $("#cnt-name").val(cnt.opis);
    $("#cnt-status option").prop("selected", false);
    $("#cnt-status option:nth-child(" + ((cnt.aktivan == true) ? "2" : "3") + ")").prop("selected", true);
  };

  RGZ.adminOffChanged = function() {
    off = '';
    for (var i = 0; i < dep.rgz_sluzbe_kancelarije.length; i++) {
      if ($("#admin-off option:selected").val() == dep.rgz_sluzbe_kancelarije[i].id) {
        off = dep.rgz_sluzbe_kancelarije[i];
        break;
      }
    }
    $("#off-name").val(off.kancelarija);
    $("#off-int").val(off.rgz_kancelarije_termini[0].interval);
    $("#off-role option").prop("selected", false);
    $("#off-role option:nth-child(" + ((off.rolaId == 4) ? "2" : "3") + ")").prop("selected", true);
    $("#off-status option").prop("selected", false);
    $("#off-status option:nth-child(" + ((off.aktivan == true) ? "2" : "3") + ")").prop("selected", true);
    $(".off-day-group input").val("");
    $(".off-day-group i").removeClass("fa-check-square-o").addClass("fa-square-o");
    for (i = 0; i < off.rgz_kancelarije_termini.length; i++) {
      var dayId = '';
      switch (off.rgz_kancelarije_termini[i].dan) {
        case 1:
          dayId = 'monday';
          break;
        case 2:
          dayId = 'tuesday';
          break;
        case 3:
          dayId = 'wednesday';
          break;
        case 4:
          dayId = 'thursday';
          break;
        case 5:
          dayId = 'friday';
          break;
        default:
          break;
      }
      $("#" + dayId + " i").removeClass("fa-square-o").addClass("fa-check-square-o");
      $("#" + dayId + " .off-day-time-from").val(off.rgz_kancelarije_termini[i].pocetak);
      $("#" + dayId + " .off-day-time-to").val(off.rgz_kancelarije_termini[i].kraj);
    }
  };

  RGZ.editCnt = function() {
    if ($("#cnt-name").val() == "" || $("#admin-cnt option:selected").val() == 0) {
      inputMissing();
      return;
    }
    var data = JSON.parse('{"id": "' + $("#admin-cnt option:selected").val() + '", "opis": "' + $("#cnt-name").val() + '", "sluzbaId": "' + $("#admin-dep option:selected").val() + '", "aktivan": ' + (($("#cnt-status option:selected").val() == 1) ? "true" : "false") + '}');
    data = JSON.stringify(data);
    pleaseWait();
    $ajaxUtils.sendPutRequestWithData(
      RGZ.apiRoot + "admin/izmeniSalter" + "/" + $("#admin-cnt option:selected").val(),
      function(responseArray, status) {
        $ajaxUtils.sendGetRequest(
          RGZ.apiRoot + "admin/sluzbe",
          function(responseArray, status) {
            RGZ.adminSluzbe = responseArray;
            $(".jconfirm").remove();
            confirmSuccess();
            $("#admin-cnt option:selected").html($("#cnt-name").val());
          },
          true, RGZ.bearer
        );
      },
      true, data, RGZ.bearer
    );
  };

  RGZ.newUsr = function() {
    if ($("#usr-name").val() == "" || $("#usr-mail").val() == "" || $("#usr-role option:selected").val() == 0) {
      inputMissing();
      return;
    }
    var mail = $("#usr-mail").val();
    if (!(~mail.lastIndexOf("@") && ~mail.lastIndexOf(".") && mail.lastIndexOf("@") < mail.lastIndexOf("."))) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Адреса електронске поште запосленог није у одговарајућем формату.',
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
    var data = JSON.parse(`
      {
        "id": "33",
        "korisnicko_ime": "` + $("#usr-name").val() + `",
        "aktivan": "true",
        "potvrda": "0",
        "greske": "0",
        "vreme_blokade": "1992-02-01T07:10:33.0000000+01:00",
        "email": "` + $("#usr-mail").val() + `",
        "rola": "` + $("#usr-role option:selected").val() + `",
        "sluzbaId": "` + $("#admin-dep option:selected").val() + `"
      }
    `);
    data = JSON.stringify(data);
    pleaseWait();
    $ajaxUtils.sendPostRequestWithData(
      RGZ.apiRoot + "admin/novikorisnik",
      function(responseArray, status) {
        $ajaxUtils.sendGetRequest(
          RGZ.apiRoot + "admin/sluzbe",
          function(responseArray, status) {
            RGZ.adminSluzbe = responseArray;
            $(".jconfirm").remove();
            confirmSuccess();
          },
          true, RGZ.bearer
        );
      },
      true, data, RGZ.bearer
    );
  };

  RGZ.adminUsrChanged = function() {
    var usr = '';
    for (var i = 0; i < dep.rgz_Korisnici.length; i++) {
      if ($("#admin-usr option:selected").val() == dep.rgz_Korisnici[i].id) {
        usr = dep.rgz_Korisnici[i];
        break;
      }
    }
    $("#usr-name").val(usr.korisnicko_ime);
    $("#usr-mail").val(usr.email);
    $("#usr-status option").prop("selected", false);
    $("#usr-status option:nth-child(" + ((usr.aktivan == true) ? "2" : "3") + ")").prop("selected", true);
    $("#usr-role option").prop("selected", false);
    $("#usr-role option").each(function() {
      if ($(this).val() == usr.rola)
        $(this).prop("selected", true);
    });
  };

  RGZ.editUsr = function() {
    if ($("#admin-usr option:selected").val() == 0 || $("#usr-name").val() == "" || $("#usr-mail").val() == "" || $("#usr-status option:selected").val() == 0 || $("#usr-role option:selected").val() == 0) {
      inputMissing();
      return;
    }
    var mail = $("#usr-mail").val();
    if (!(~mail.lastIndexOf("@") && ~mail.lastIndexOf(".") && mail.lastIndexOf("@") < mail.lastIndexOf("."))) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Адреса електронске поште запосленог није у одговарајућем формату.',
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
    var data = JSON.parse(`
      {
        "id": "` + $("#admin-usr option:selected").val() + `",
        "korisnicko_ime": "` + $("#usr-name").val() + `",
        "aktivan": ` + (($("#usr-status option:selected").val() == 1) ? `"true"` : `"false"`) + `,
        "potvrda": "0",
        "greske": "0",
        "vreme_blokade": "1992-02-01T07:10:33.0000000+01:00",
        "email": "` + $("#usr-mail").val() + `",
        "rola": "` + $("#usr-role option:selected").val() + `",
        "sluzbaId": "` + $("#admin-dep option:selected").val() + `"
      }
    `);
    data = JSON.stringify(data);
    pleaseWait();
    $ajaxUtils.sendPutRequestWithData(
      RGZ.apiRoot + "admin/izmeniKorisnika" + "/" + $("#admin-usr option:selected").val(),
      function(responseArray, status) {
        $ajaxUtils.sendGetRequest(
          RGZ.apiRoot + "admin/sluzbe",
          function(responseArray, status) {
            RGZ.adminSluzbe = responseArray;
            $(".jconfirm").remove();
            confirmSuccess();
            $("#admin-usr option:selected").html($("#usr-name").val());
          },
          true, RGZ.bearer
        );
      },
      true, data, RGZ.bearer
    );
  };

  RGZ.offDayClicked = function(e) {
    if ($(e).find("i").hasClass("fa-square-o")) {
      $(e).find("i").removeClass("fa-square-o");
      $(e).find("i").addClass("fa-check-square-o");
    } else {
      $(e).find("i").addClass("fa-square-o");
      $(e).find("i").removeClass("fa-check-square-o");
      $(e).parent().find("input").val("");
    }
  };

  RGZ.newOff = function() {
    if ($("#off-name").val() == "" || $("#off-int").val() == "" || $("#off-role option:selected").val() == 0) {
      inputMissing();
      return;
    }
    var daysCheck = false;
    var daysArray = [];
    var offInt = $("#off-int").val();
    var selection = $(".fa-check-square-o");
    if (selection.length > 0) daysCheck = true;
    for (var i = 0; i < selection.length; i++) {
      var dayContainer = $(selection[i]).parent().parent();
      var dayId = $(dayContainer).attr("value");
      var timeFrom = $(dayContainer).find(".off-day-times").find(".off-day-time-from").val();
      var timeTo = $(dayContainer).find(".off-day-times").find(".off-day-time-to").val();
      var dayItem = JSON.parse(`
        {
          "id": "33",
          "kancelarijaId": "0",
          "dan": "` + dayId + `",
          "pocetak": "` + timeFrom + `",
          "kraj": "` + timeTo + `",
          "interval": "` + offInt + `"
        }
      `);
      daysArray.push(dayItem);
      if (timeFrom == '' || timeTo == '') {
        daysCheck = false;
        break;
      }
      if (timeFrom >= timeTo) {
        daysCheck = false;
        break;
      }
    }
    if (daysCheck == false) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Радно време за рад са странкама није у одговарајућем формату.<br><br><span>Морате одабрати дане за рад са странкама приликом прављења нове канцеларије. Одабрани дани морају да имају уписано почетно и крајње време рада са странкама у одговарајућем поретку.</span>',
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
    var data = JSON.parse(`
      {
        "id": "33",
        "sluzbaId": "` + $("#admin-dep option:selected").val() + `",
        "kancelarija": "` + $("#off-name").val() + `",
        "rolaId": ` + $("#off-role option:selected").val() + `,
        "aktivan": "true"
      }
    `);
    data = JSON.stringify(data);
    pleaseWait();
    $ajaxUtils.sendPostRequestWithData(
      RGZ.apiRoot + "admin/novakancelarija",
      function(responseArray, status) {
        var sync = 0;
        for (var i = 0; i < daysArray.length; i++) {
          daysArray[i].kancelarijaId = responseArray.id;
          $ajaxUtils.sendPostRequestWithData(
            RGZ.apiRoot + "admin/noviterminkancelarija",
            function(responseArray, status) {
              sync = sync + 1;
              if (sync == daysArray.length) {
                $ajaxUtils.sendGetRequest(
                  RGZ.apiRoot + "admin/sluzbe",
                  function(responseArray, status) {
                    RGZ.adminSluzbe = responseArray;
                    $(".jconfirm").remove();
                    confirmSuccess();
                  },
                  true, RGZ.bearer
                );
              }
            },
            true, JSON.stringify(daysArray[i]), RGZ.bearer
          );
        }
      },
      true, data, RGZ.bearer
    );
  };

  RGZ.editOff = function() {
    if ($("#off-name").val() == "" || $("#off-int").val() == "" || $("#off-role option:selected").val() == 0 || $("#off-status option:selected").val() == 0) {
      inputMissing();
      return;
    }
    var daysCheck = false;
    var daysArray = [];
    var offInt = $("#off-int").val();
    var selection = $(".fa-check-square-o");
    if (selection.length > 0) daysCheck = true;
    for (var i = 0; i < selection.length; i++) {
      var dayContainer = $(selection[i]).parent().parent();
      var dayId = $(dayContainer).attr("value");
      var timeFrom = $(dayContainer).find(".off-day-times").find(".off-day-time-from").val();
      var timeTo = $(dayContainer).find(".off-day-times").find(".off-day-time-to").val();
      var dayItem = JSON.parse(`
        {
          "id": "33",
          "kancelarijaId": "0",
          "dan": "` + dayId + `",
          "pocetak": "` + timeFrom + `",
          "kraj": "` + timeTo + `",
          "interval": "` + offInt + `"
        }
      `);
      daysArray.push(dayItem);
      if (timeFrom == '' || timeTo == '') {
        daysCheck = false;
        break;
      }
      if (timeFrom >= timeTo) {
        daysCheck = false;
        break;
      }
    }
    if (daysCheck == false) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Радно време за рад са странкама није у одговарајућем формату.<br><br><span>Морате одабрати дане за рад са странкама приликом прављења нове канцеларије. Одабрани дани морају да имају уписано почетно и крајње време рада са странкама у одговарајућем поретку.</span>',
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
    var data = JSON.parse(`
      {
        "id": "` + $("#admin-off option:selected").val() + `",
        "sluzbaId": "` + $("#admin-dep option:selected").val() + `",
        "kancelarija": "` + $("#off-name").val() + `",
        "rolaId": ` + $("#off-role option:selected").val() + `,
        "aktivan": "` + (($("#off-status option:selected").val() == 1) ? "true" : "false") + `"
      }
    `);
    data = JSON.stringify(data);
    pleaseWait();
    $ajaxUtils.sendPutRequestWithData(
      RGZ.apiRoot + "admin/izmeniKancelariju" + "/" + $("#admin-off option:selected").val(),
      function(responseArray, status) {
        var synco = 0;
        for (var j = 0; j < off.rgz_kancelarije_termini.length; j++) {
          $ajaxUtils.sendDeleteRequest(
            RGZ.apiRoot + "admin/obrisiTermin" + "/" + off.rgz_kancelarije_termini[j].id,
            function(responseArray, status) {
              synco = synco + 1;
              if (synco == off.rgz_kancelarije_termini.length) {
                var sync = 0;
                for (var i = 0; i < daysArray.length; i++) {
                  daysArray[i].kancelarijaId = $("#admin-off option:selected").val();
                  $ajaxUtils.sendPostRequestWithData(
                    RGZ.apiRoot + "admin/noviterminkancelarija",
                    function(responseArray, status) {
                      sync = sync + 1;
                      if (sync == daysArray.length) {
                        $ajaxUtils.sendGetRequest(
                          RGZ.apiRoot + "admin/sluzbe",
                          function(responseArray, status) {
                            RGZ.adminSluzbe = responseArray;
                            for (var k = 0; k < RGZ.adminSluzbe.length; k++) {
                              if (RGZ.adminSluzbe[k].id == $("#admin-dep option:selected").val()) {
                                for (var l = 0; l < RGZ.adminSluzbe[k].rgz_sluzbe_kancelarije.length; l++) {
                                  if (RGZ.adminSluzbe[k].rgz_sluzbe_kancelarije[l].id == $("#admin-off option:selected").val()) {
                                    off = RGZ.adminSluzbe[k].rgz_sluzbe_kancelarije[l];
                                    break;
                                  }
                                }
                                break;
                              }
                            }
                            $(".jconfirm").remove();
                            confirmSuccess();
                            $("#admin-off option:selected").html($("#off-name").val());
                          },
                          true, RGZ.bearer
                        );
                      }
                    },
                    true, JSON.stringify(daysArray[i]), RGZ.bearer
                  );
                }
              }
            },
            true, RGZ.bearer
          );
        }
      },
      true, data, RGZ.bearer
    );
  };

  RGZ.adminSearch = function() {
    for (var i = 0; i < RGZ.adminSluzbe.length; i++)
      if (RGZ.adminSluzbe[i].id == $("#admin-dep option:selected").val()) {
        dep = RGZ.adminSluzbe[i];
        break;
      }
    var formHtml = '';
    if ($("#admin-action").val() == 2) {
      //izmena službe
      formHtml = `
        <div class="form-label">Назив службе:</div>
        <input id="dep-name" type="text">
        <div class="form-label">Адреса службе:</div>
        <input id="dep-address" type="text">
        <div class="form-label">DMS идентификатор службе:</div>
        <input id="dep-dms" type="text" onkeyup="$RGZ.numbersOnly(this);" onkeydown="$RGZ.numbersOnly(this);">
        <div class="form-label">Почетак радног времена шалтера:</div>
        <input id="dep-start" type="text">
        <div class="form-label">Крај радног времена шалтера:</div>
        <input id="dep-end" type="text">
        <div class="form-label">Интервал за шалтере [min]:</div>
        <input id="dep-int" type="text" maxlength="2" onkeyup="$RGZ.numbersOnly(this);" onkeydown="$RGZ.numbersOnly(this);">
        <div class="form-search-button" onclick="$RGZ.editDep();">ОК</div>
      `;
    } else if ($("#admin-action").val() == 3) {
      //novi šalter
      formHtml = `
        <div class="form-label">Назив шалтера:</div>
        <input id="cnt-name" type="text">
        <div class="form-search-button" onclick="$RGZ.newCnt();">ОК</div>
      `;
    } else if ($("#admin-action").val() == 4) {
      //izmena šaltera
      formHtml = `
        <div class="form-label">Стари назив шалтера:</div>
        <select id="admin-cnt" onchange="$RGZ.adminCntChanged();">
          <option value="0" disabled selected hidden> </option>
      `;
      for (i = 0; i < dep.rgz_salteri.length; i++)
        formHtml += `<option value="` + dep.rgz_salteri[i].id + `">` + dep.rgz_salteri[i].opis + `</option>`;
      formHtml += `
        </select>
        <div class="form-label">Нови назив шалтера:</div>
        <input id="cnt-name" type="text">
        <div class="form-label">Статус:</div>
        <select id="cnt-status">
          <option value="0" disabled selected hidden> </option>
          <option value="1">АКТИВАН</option>
          <option value="2">НЕАКТИВАН</option>
        </select>
        <div class="form-search-button" onclick="$RGZ.editCnt();">ОК</div>
      `;
    } else if ($("#admin-action").val() == 5) {
      //novi korisnik
      formHtml = `
        <div class="form-label">Корисничко име:</div>
        <input id="usr-name" type="text">
        <div class="form-label">e-mail:</div>
        <input id="usr-mail" type="text">
        <div class="form-label">Улога:</div>
        <select id="usr-role">
          <option value="0" disabled selected hidden> </option>
      `;
      for (i = ((RGZ.loginInfo.rola == 1 && $("#admin-dep option:selected").val() == 1) ? 0 : 1); i < ((RGZ.loginInfo.rola == 1 && $("#admin-dep option:selected").val() == 1) ? 1 : RGZ.adminRole.length); i++)
        formHtml += `<option value="` + RGZ.adminRole[i].id + `">` + RGZ.adminRole[i].rola + `</option>`;
      formHtml += `
        </select>
        <div class="form-search-button" onclick="$RGZ.newUsr();">ОК</div>
      `;
    } else if ($("#admin-action").val() == 6) {
      //izmena korisnika
      formHtml = `
        <div class="form-label">Старо корисничко име:</div>
        <select id="admin-usr" onchange="$RGZ.adminUsrChanged();">
          <option value="0" disabled selected hidden> </option>
      `;
      for (i = 0; i < dep.rgz_Korisnici.length; i++)
        formHtml += `<option value="` + dep.rgz_Korisnici[i].id + `">` + dep.rgz_Korisnici[i].korisnicko_ime + `</option>`;
      formHtml += `
        </select>
        <div class="form-label">Ново корисничко име:</div>
        <input id="usr-name" type="text">
        <div class="form-label">e-mail:</div>
        <input id="usr-mail" type="text">
        <div class="form-label">Статус:</div>
        <select id="usr-status">
          <option value="0" disabled selected hidden> </option>
          <option value="1">АКТИВАН</option>
          <option value="2">НЕАКТИВАН</option>
        </select>
        <div class="form-label">Улога:</div>
        <select id="usr-role">
          <option value="0" disabled selected hidden> </option>
      `;
      for (i = ((RGZ.loginInfo.rola == 1 && $("#admin-dep option:selected").val() == 1) ? 0 : 1); i < ((RGZ.loginInfo.rola == 1 && $("#admin-dep option:selected").val() == 1) ? 1 : RGZ.adminRole.length); i++)
        formHtml += `<option value="` + RGZ.adminRole[i].id + `">` + RGZ.adminRole[i].rola + `</option>`;
      formHtml += `
        </select>
        <div class="form-search-button" onclick="$RGZ.editUsr();">ОК</div>
      `;
    } else if ($("#admin-action").val() == 11) {
      //nova kancelarija
      formHtml = `
        <div class="form-label">Назив канцеларије:</div>
        <input id="off-name" type="text">
        <div class="form-label">Функција канцеларијског службеника:</div>
        <select id="off-role">
          <option value="0" disabled selected hidden> </option>
      `;
      for (i = 3; i < RGZ.adminRole.length; i++)
        formHtml += `<option value="` + RGZ.adminRole[i].id + `">` + RGZ.adminRole[i].rola + `</option>`;
      formHtml += `
        </select>
        <div class="form-label">Интервал [min]:</div>
        <input id="off-int" type="text" maxlength="2" onkeyup="$RGZ.numbersOnly(this);" onkeydown="$RGZ.numbersOnly(this);">
        <div class="form-label">Дани за пријем странака:</div>
        <div class="off-day-group">
          <div class="off-day" id="monday" value="1">
            <div class="off-day-checklabel" onclick="$RGZ.offDayClicked(this);">
              <i class="fa fa-square-o"></i>
              понедељак
            </div>
            <div class="off-day-times">
              <input class="off-day-time-from" type="text">
              <div>-</div>
              <input class="off-day-time-to" type="text">
            </div>
          </div>
          <div class="off-day" id="tuesday" value="2">
            <div class="off-day-checklabel" onclick="$RGZ.offDayClicked(this);">
              <i class="fa fa-square-o"></i>
              уторак
            </div>
            <div class="off-day-times">
              <input class="off-day-time-from" type="text">
              <div>-</div>
              <input class="off-day-time-to" type="text">
            </div>
          </div>
          <div class="off-day" id="wednesday" value="3">
            <div class="off-day-checklabel" onclick="$RGZ.offDayClicked(this);">
              <i class="fa fa-square-o"></i>
              среда
            </div>
            <div class="off-day-times">
              <input class="off-day-time-from" type="text">
              <div>-</div>
              <input class="off-day-time-to" type="text">
            </div>
          </div>
          <div class="off-day" id="thursday" value="4">
            <div class="off-day-checklabel" onclick="$RGZ.offDayClicked(this);">
              <i class="fa fa-square-o"></i>
              четвртак
            </div>
            <div class="off-day-times">
              <input class="off-day-time-from" type="text">
              <div>-</div>
              <input class="off-day-time-to" type="text">
            </div>
          </div>
          <div class="off-day" id="friday" value="5">
            <div class="off-day-checklabel" onclick="$RGZ.offDayClicked(this);">
              <i class="fa fa-square-o"></i>
              петак
            </div>
            <div class="off-day-times">
              <input class="off-day-time-from" type="text">
              <div>-</div>
              <input class="off-day-time-to" type="text">
            </div>
          </div>
        </div>
        <div class="form-search-button" onclick="$RGZ.newOff();">ОК</div>
      `;
    } else if ($("#admin-action").val() == 12) {
      //izmena kancelarije
      formHtml = `
        <div class="form-label">Стари назив канцеларије:</div>
        <select id="admin-off" onchange="$RGZ.adminOffChanged();">
          <option value="0" disabled selected hidden> </option>
      `;
      for (i = 0; i < dep.rgz_sluzbe_kancelarije.length; i++)
        formHtml += `<option value="` + dep.rgz_sluzbe_kancelarije[i].id + `">` + dep.rgz_sluzbe_kancelarije[i].kancelarija + `</option>`;
      formHtml += `
        </select>
        <div class="form-label">Нови назив канцеларије:</div>
        <input id="off-name" type="text">
        <div class="form-label">Функција канцеларијског службеника:</div>
        <select id="off-role">
          <option value="0" disabled selected hidden> </option>
      `;
      for (i = 3; i < RGZ.adminRole.length; i++)
        formHtml += `<option value="` + RGZ.adminRole[i].id + `">` + RGZ.adminRole[i].rola + `</option>`;
      formHtml += `
        </select>
        <div class="form-label">Интервал [min]:</div>
        <input id="off-int" type="text" maxlength="2" onkeyup="$RGZ.numbersOnly(this);" onkeydown="$RGZ.numbersOnly(this);">
        <div class="form-label">Статус:</div>
        <select id="off-status">
          <option value="0" disabled selected hidden> </option>
          <option value="1">АКТИВАН</option>
          <option value="2">НЕАКТИВАН</option>
        </select>
        <div class="form-label">Дани за пријем странака:</div>
        <div class="off-day-group">
          <div class="off-day" id="monday" value="1">
            <div class="off-day-checklabel" onclick="$RGZ.offDayClicked(this);">
              <i class="fa fa-square-o"></i>
              понедељак
            </div>
            <div class="off-day-times">
              <input class="off-day-time-from" type="text">
              <div>-</div>
              <input class="off-day-time-to" type="text">
            </div>
          </div>
          <div class="off-day" id="tuesday" value="2">
            <div class="off-day-checklabel" onclick="$RGZ.offDayClicked(this);">
              <i class="fa fa-square-o"></i>
              уторак
            </div>
            <div class="off-day-times">
              <input class="off-day-time-from" type="text">
              <div>-</div>
              <input class="off-day-time-to" type="text">
            </div>
          </div>
          <div class="off-day" id="wednesday" value="3">
            <div class="off-day-checklabel" onclick="$RGZ.offDayClicked(this);">
              <i class="fa fa-square-o"></i>
              среда
            </div>
            <div class="off-day-times">
              <input class="off-day-time-from" type="text">
              <div>-</div>
              <input class="off-day-time-to" type="text">
            </div>
          </div>
          <div class="off-day" id="thursday" value="4">
            <div class="off-day-checklabel" onclick="$RGZ.offDayClicked(this);">
              <i class="fa fa-square-o"></i>
              четвртак
            </div>
            <div class="off-day-times">
              <input class="off-day-time-from" type="text">
              <div>-</div>
              <input class="off-day-time-to" type="text">
            </div>
          </div>
          <div class="off-day" id="friday" value="5">
            <div class="off-day-checklabel" onclick="$RGZ.offDayClicked(this);">
              <i class="fa fa-square-o"></i>
              петак
            </div>
            <div class="off-day-times">
              <input class="off-day-time-from" type="text">
              <div>-</div>
              <input class="off-day-time-to" type="text">
            </div>
          </div>
        </div>
        <div class="form-search-button" onclick="$RGZ.editOff();">ОК</div>
      `;
    }
    insertHtml("#admin-action-form", formHtml);
    if ($("#admin-action").val() == 2) {
      $("#dep-start").timepicker();
      $("#dep-end").timepicker();
      $("#dep-name").val(dep.sluzba);
      $("#dep-address").val(dep.adresa);
      $("#dep-dms").val(dep.dms_sluzbaId);
      $("#dep-start").val(dep.pocetak_radnog_vremena);
      $("#dep-end").val(dep.kraj_radnog_vremena);
      $("#dep-int").val(dep.interval_za_saltere);
    } else if ($("#admin-action").val() == 11 || $("#admin-action").val() == 12) {
      $(".off-day-time-from").timepicker();
      $(".off-day-time-to").timepicker();
    }
    appear($("#admin-action-form"), 500);
  };

  inputMissing = function() {
    $.confirm({
      title: 'ГРЕШКА!',
      content: 'Морате унети/одабрати вредности свих поља.',
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
  };

  pleaseWait = function() {
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
  };

  confirmSuccess = function() {
    $.confirm({
      title: 'ПОТВРДА',
      content: 'Измене у систему успешно реализоване.',
      theme: 'supervan',
      buttons: {
        ok: {
          text: 'ОК',
          btnClass: 'btn-white-rgz',
          keys: ['enter'],
          action: function() {}
        }
      }
    });
  };

  RGZ.newDep = function() {
    if ($("#dep-name").val() == "" || $("#dep-address").val() == "" || $("#dep-dms").val() == "" || $("#dep-start").val() == "" || $("#dep-end").val() == "" || $("#dep-int").val() == "") {
      inputMissing();
      return;
    }
    if ($("#dep-start").val() >= $("#dep-end").val()) {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Време почетка и време краја радног времена нису у одговарајућем поретку.',
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
    var data = JSON.parse('{"sluzba": "' + $("#dep-name").val() + '", "adresa": "' + $("#dep-address").val() + '", "pocetak_radnog_vremena": "' + $("#dep-start").val() + '", "kraj_radnog_vremena": "' + $("#dep-end").val() + '", "interval_za_saltere": "' + $("#dep-int").val() + '", "dms_sluzbaId": "' + $("#dep-dms").val() + '"}');
    data = JSON.stringify(data);
    pleaseWait();
    $ajaxUtils.sendPostRequestWithData(
      RGZ.apiRoot + "admin/novasluzba",
      function(responseArray, status) {
        $ajaxUtils.sendGetRequest(
          RGZ.apiRoot + "admin/sluzbe",
          function(responseArray, status) {
            RGZ.adminSluzbe = responseArray;
            $(".jconfirm").remove();
            confirmSuccess();
          },
          true, RGZ.bearer
        );
      },
      true, data, RGZ.bearer
    );
  };

  RGZ.newHol = function() {
    if ($("#hol-day").val() == "") {
      inputMissing();
      return;
    }
    var data = JSON.parse('{"id": "33", "datum": "' + $("#hol-day").val().substring(6, 10) + "-" + $("#hol-day").val().substring(3, 5) + "-" + $("#hol-day").val().substring(0, 2) + '"}');
    data = JSON.stringify(data);
    pleaseWait();
    $ajaxUtils.sendPostRequestWithData(
      RGZ.apiRoot + "admin/novipraznik",
      function(responseArray, status) {
        $ajaxUtils.sendGetRequest(
          RGZ.apiRoot + "admin/praznici",
          function(responseArray, status) {
            RGZ.adminPraznici = responseArray;
            $(".jconfirm").remove();
            confirmSuccess();
          },
          true, RGZ.bearer
        );
      },
      true, data, RGZ.bearer
    );
  };

  RGZ.delHol = function() {
    if ($("#admin-hol option:selected").val() == 0) {
      inputMissing();
      return;
    }
    pleaseWait();
    $ajaxUtils.sendDeleteRequest(
      RGZ.apiRoot + "admin/obrisiPraznik" + "/" + $("#admin-hol option:selected").val(),
      function(responseArray, status) {
        $ajaxUtils.sendGetRequest(
          RGZ.apiRoot + "admin/praznici",
          function(responseArray, status) {
            RGZ.adminPraznici = responseArray;
            $(".jconfirm").remove();
            confirmSuccess();
            var selectHtml = `
              <option value="0" disabled selected hidden> </option>
            `;
            for (var i = 0; i < RGZ.adminPraznici.length; i++)
              selectHtml += `<option value="` + RGZ.adminPraznici[i].id + `">` + RGZ.adminPraznici[i].datum.substring(8, 10) + `.` + RGZ.adminPraznici[i].datum.substring(5, 7) + `.` + RGZ.adminPraznici[i].datum.substring(0, 4) + `.</option>`;
            insertHtml("#admin-hol", selectHtml);
          },
          true, RGZ.bearer
        );
      },
      true, RGZ.bearer
    );
  };

  RGZ.newDoc = function() {
    if ($("#hol-day").val() == "") {
      inputMissing();
      return;
    }
    var data = JSON.parse('{"id": "33", "opis": "' + $("#doc-name").val() + '", "aktivan": "true"}');
    data = JSON.stringify(data);
    pleaseWait();
    $ajaxUtils.sendPostRequestWithData(
      RGZ.apiRoot + "admin/noviDokument",
      function(responseArray, status) {
        $ajaxUtils.sendGetRequest(
          RGZ.apiRoot + "admin/dokumenti",
          function(responseArray, status) {
            RGZ.adminDokumenti = responseArray;
            $(".jconfirm").remove();
            confirmSuccess();
          },
          true, RGZ.bearer
        );
      },
      true, data, RGZ.bearer
    );
  };

  RGZ.editDoc = function() {
    if ($("#doc-name").val() == "" || $("#admin-doc option:selected").val() == 0) {
      inputMissing();
      return;
    }
    var data = JSON.parse('{"id": "' + $("#admin-doc option:selected").val() + '", "opis": "' + $("#doc-name").val() + '", "aktivan": ' + (($("#doc-status option:selected").val() == 1) ? "true" : "false") + '}');
    data = JSON.stringify(data);
    pleaseWait();
    $ajaxUtils.sendPutRequestWithData(
      RGZ.apiRoot + "admin/izmeniDokument" + "/" + $("#admin-doc option:selected").val(),
      function(responseArray, status) {
        $ajaxUtils.sendGetRequest(
          RGZ.apiRoot + "admin/dokumenti",
          function(responseArray, status) {
            RGZ.adminDokumenti = responseArray;
            $(".jconfirm").remove();
            confirmSuccess();
            $("#admin-doc option:selected").html($("#doc-name").val());
          },
          true, RGZ.bearer
        );
      },
      true, data, RGZ.bearer
    );
  };

  RGZ.adminDocChanged = function() {
    $("#doc-name").val($("#admin-doc option:selected").html());
    var doc = '';
    for (var i = 0; i < RGZ.adminDokumenti.length; i++) {
      if ($("#admin-doc option:selected").val() == RGZ.adminDokumenti[i].id) {
        doc = RGZ.adminDokumenti[i];
        break;
      }
    }
    $("#doc-name").val(doc.opis);
    $("#doc-status option").prop("selected", false);
    $("#doc-status option:nth-child(" + ((doc.aktivan == true) ? "2" : "3") + ")").prop("selected", true);
  };

  RGZ.adminAction = function() {
    disappear($("#admin-dep, #admin-action-form"), 500);
    $(".content-box-content").animate({
      scrollTop: 0
    }, 500);
    setTimeout(function() {
      var i;
      if ($("#admin-action").val() == 2 || $("#admin-action").val() == 3 || $("#admin-action").val() == 4 || $("#admin-action").val() == 5 || $("#admin-action").val() == 6 || $("#admin-action").val() == 11 || $("#admin-action").val() == 12) {
        var adminDepHtml = '<option disabled selected hidden>ИЗАБЕРИТЕ СЛУЖБУ...</option>';
        for (i = 0; i < RGZ.adminSluzbe.length; i++) {
          if (RGZ.adminSluzbe[i].id == 1 && (RGZ.loginInfo.rola != 1 || $("#admin-action").val() == 2 || $("#admin-action").val() == 3 || $("#admin-action").val() == 4 || $("#admin-action").val() == 11 || $("#admin-action").val() == 12)) continue;
          adminDepHtml += `<option value="` + RGZ.adminSluzbe[i].id + `">` + RGZ.adminSluzbe[i].sluzba + `</option>`;
        }
        insertHtml("#admin-dep", adminDepHtml);
        appear($("#admin-dep"), 500);
      } else {
        var formHtml = '';
        if ($("#admin-action").val() == 1) {
          //nova služba
          formHtml = `
            <div class="form-label">Назив службе:</div>
            <input id="dep-name" type="text">
            <div class="form-label">Адреса службе:</div>
            <input id="dep-address" type="text">
            <div class="form-label">DMS идентификатор службе:</div>
            <input id="dep-dms" type="text" onkeyup="$RGZ.numbersOnly(this);" onkeydown="$RGZ.numbersOnly(this);">
            <div class="form-label">Почетак радног времена шалтера:</div>
            <input id="dep-start" type="text">
            <div class="form-label">Крај радног времена шалтера:</div>
            <input id="dep-end" type="text">
            <div class="form-label">Интервал за шалтере [min]:</div>
            <input id="dep-int" type="text" maxlength="2" onkeyup="$RGZ.numbersOnly(this);" onkeydown="$RGZ.numbersOnly(this);">
            <div class="form-search-button" onclick="$RGZ.newDep();">ОК</div>
          `;
        } else if ($("#admin-action").val() == 7) {
          //novi praznik
          formHtml = `
            <div class="form-label">Нерадни дан:</div>
            <input id="hol-day" type="text" readonly>
            <div class="form-search-button" onclick="$RGZ.newHol();">ОК</div>
          `;
        } else if ($("#admin-action").val() == 8) {
          //brisanje praznika
          formHtml = `
            <div class="form-label">Радни дан:</div>
            <select id="admin-hol">
              <option value="0" disabled selected hidden> </option>
          `;
          for (i = 0; i < RGZ.adminPraznici.length; i++)
            formHtml += `<option value="` + RGZ.adminPraznici[i].id + `">` + RGZ.adminPraznici[i].datum.substring(8, 10) + `.` + RGZ.adminPraznici[i].datum.substring(5, 7) + `.` + RGZ.adminPraznici[i].datum.substring(0, 4) + `.</option>`;
          formHtml += `
            </select>
            <div class="form-search-button" onclick="$RGZ.delHol();">ОК</div>
          `;
        } else if ($("#admin-action").val() == 9) {
          //novi dokument
          formHtml = `
            <div class="form-label">Назив документа:</div>
            <input id="doc-name" type="text">
            <div class="form-search-button" onclick="$RGZ.newDoc();">ОК</div>
          `;
        } else if ($("#admin-action").val() == 10) {
          //izmena dokumenta
          formHtml = `
            <div class="form-label">Стари назив документа:</div>
            <select id="admin-doc" onchange="$RGZ.adminDocChanged();">
              <option value="0" disabled selected hidden> </option>
          `;
          for (i = 0; i < RGZ.adminDokumenti.length; i++)
            formHtml += `<option value="` + RGZ.adminDokumenti[i].id + `">` + RGZ.adminDokumenti[i].opis + `</option>`;
          formHtml += `
            </select>
            <div class="form-label">Нови назив документа:</div>
            <input id="doc-name" type="text">
            <div class="form-label">Статус:</div>
            <select id="doc-status">
              <option value="0" disabled selected hidden> </option>
              <option value="1">АКТИВАН</option>
              <option value="2">НЕАКТИВАН</option>
            </select>
            <div class="form-search-button" onclick="$RGZ.editDoc();">ОК</div>
          `;
        }
        insertHtml("#admin-action-form", formHtml);
        setTimeout(function() {
          if ($("#admin-action").val() == 7)
            $("#hol-day").datepicker({
              format: "dd.mm.yyyy.",
              autoclose: true,
              todayBtn: true,
              language: "sr",
              startDate: "+1d",
              daysOfWeekDisabled: [0, 6]
            });
          else if ($("#admin-action").val() == 1) {
            $("#dep-start").timepicker();
            $("#dep-end").timepicker();
          }
        }, 10);
        appear($("#admin-action-form"), 500);
      }
    }, 550);
  };

  adminDataFetchedAux = function() {
    var scheduleContentHtml = `
      <div id="schedule-password-change" class="schedule-navi-button" onclick="$RGZ.schedulePasswordChange();"><i class="fa fa-key"></i></div>
      <div id="logout" class="schedule-navi-button" onclick="$RGZ.logout();"><i class="fa fa-sign-out"></i></div>
      <div id="schedule-searchbar" class="row">
        <div class="col-lg-3 hidden-md-down"></div>
        <div class="col-12 col-lg-6">
          <select id="admin-action" onchange="$RGZ.adminAction();">
            <option value="0" disabled selected hidden>ИЗАБЕРИТЕ ВРСТУ ИЗМЕНЕ...</option>
    `;
    if (RGZ.loginInfo.rola == 1)
      scheduleContentHtml += `
            <option value="1">Нова служба</option>
            <option value="2">Измена службе</option>
      `;
    scheduleContentHtml += `
            <option value="3">Нови шалтер</option>
            <option value="4">Измена шалтера</option>
            <option value="5">Нови корисник</option>
            <option value="6">Измена корисника</option>
            <option value="7">Нови празник</option>
            <option value="8">Брисање празника</option>
            <option value="9">Нови документ</option>
            <option value="10">Измена документа</option>
            <option value="11">Нова канцеларија</option>
            <option value="12">Измена канцеларије</option>
          </select>
          <select id="admin-dep" onchange="$RGZ.adminSearch();" class="gone">
            <option disabled selected hidden>ИЗАБЕРИТЕ СЛУЖБУ...</option>
    `;
    scheduleContentHtml += `
          </select>
          <div id="admin-action-form" class="gone"></div>
        </div>
        <div class="col-lg-3 hidden-md-down"></div>
      </div>
    `;
    insertHtml("#schedule-content .content-box-content", scheduleContentHtml);
    setTimeout(function() {
      appear($(".content-box-content"), 500);
      disappear($(".content-box-loader"), 200);
      disappear($("#navi-landing"), 500);
    }, 500);
  };

  RGZ.scheduleAux = function() {
    var tokens = JSON.parse(sessionStorage.getItem(RGZ.ssTokenLabel));
    RGZ.bearer = tokens.access_token;
    RGZ.loginInfo = tokens;
    RGZ.zakazaniTermini = [];
    var sync = ((RGZ.loginInfo.rola == 7) ? 4 : 3);
    if (RGZ.loginInfo.rola == 7) {
      $ajaxUtils.sendGetRequest(
        RGZ.apiRoot + "admin/sluzbeIC",
        function(responseArray, status) {
          svSluzbe = responseArray;
          sync = sync - 1;
          if (sync == 0)
            dataFetchedAux();
        },
        true, RGZ.bearer
      );
    }
    $ajaxUtils.sendGetRequest(
      RGZ.apiRoot + "korisnici/zakazaniTermini",
      function(responseArray, status) {
        for (var m = 0; m < responseArray.length; m++) {
          responseArray[m]["isOffice"] = false;
          RGZ.zakazaniTermini.push(responseArray[m]);
        }
        sync = sync - 1;
        if (sync == 0)
          dataFetchedAux();
      },
      true, RGZ.bearer
    );
    var date = new Date();
    var day = ((date.getDate() < 10) ? "0" : "") + date.getDate();
    var month = ((date.getMonth() + 1 < 10) ? "0" : "") + (date.getMonth() + 1);
    var year = date.getFullYear();
    $ajaxUtils.sendGetRequest(
      RGZ.apiRoot + "korisnici/zakazaniTerminiKancelarije" + "?datum=" + encodeURIComponent(year + "-" + month + "-" + day),
      function(responseArray, status) {
        for (var n = 0; n < responseArray.length; n++) {
          responseArray[n]["isOffice"] = true;
          RGZ.zakazaniTermini.push(responseArray[n]);
        }
        sync = sync - 1;
        if (sync == 0)
          dataFetchedAux();
      },
      true, RGZ.bearer
    );
    $ajaxUtils.sendGetRequest(
      RGZ.apiRoot + "korisnici/razloziOtkazivanja",
      function(responseArray, status) {
        RGZ.razloziOtkazivanja = responseArray;
        sync = sync - 1;
        if (sync == 0)
          dataFetchedAux();
      },
      true, RGZ.bearer
    );
  };

  RGZ.adminAux = function() {
    var tokens = JSON.parse(sessionStorage.getItem(RGZ.ssTokenLabel));
    if (tokens == null) return;
    RGZ.bearer = tokens.access_token;
    RGZ.loginInfo = tokens;
    var sync = 4;
    $ajaxUtils.sendGetRequest(
      RGZ.apiRoot + "admin/role",
      function(responseArray, status) {
        RGZ.adminRole = responseArray;
        sync = sync - 1;
        if (sync == 0)
          adminDataFetchedAux();
      },
      true, RGZ.bearer
    );
    $ajaxUtils.sendGetRequest(
      RGZ.apiRoot + "admin/sluzbe",
      function(responseArray, status) {
        RGZ.adminSluzbe = responseArray;
        sync = sync - 1;
        if (sync == 0)
          adminDataFetchedAux();
      },
      true, RGZ.bearer
    );
    $ajaxUtils.sendGetRequest(
      RGZ.apiRoot + "admin/praznici",
      function(responseArray, status) {
        RGZ.adminPraznici = responseArray;
        sync = sync - 1;
        if (sync == 0)
          adminDataFetchedAux();
      },
      true, RGZ.bearer
    );
    $ajaxUtils.sendGetRequest(
      RGZ.apiRoot + "admin/dokumenti",
      function(responseArray, status) {
        RGZ.adminDokumenti = responseArray;
        sync = sync - 1;
        if (sync == 0)
          adminDataFetchedAux();
      },
      true, RGZ.bearer
    );
  };

  RGZ.login = function() {
    if ($("#username").val() == "" || $("#password").val() == "") {
      $.confirm({
        title: 'ГРЕШКА!',
        content: 'Морате унети и корисничко име и шифру.',
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
    disappear($(".content-box-content"), 500);
    appear($(".content-box-loader"), 200);
    $("#username, #password").attr("disabled", true);
    var data = "username=" + encodeURIComponent($("#username").val()) + "&password=" + encodeURIComponent($("#password").val()) + "&grant_type=password&client_id=837rgz";
    $.post(RGZ.apiRoot.substring(0, RGZ.apiRoot.length - 4) + "token", data, function(response) {
      sessionStorage.setItem(RGZ.ssTokenLabel, JSON.stringify(response));
      if (response.rola < 3 && ~location.pathname.indexOf('termini')) {
        location.pathname = location.pathname.replace('termini', 'admin');
      } else if (response.rola < 3 && ~location.pathname.indexOf('admin')) {
        RGZ.adminAux();
      } else if (response.rola >= 3 && ~location.pathname.indexOf('termini')) {
        RGZ.scheduleAux();
      } else if (response.rola >= 3 && ~location.pathname.indexOf('admin')) {
        location.pathname = location.pathname.replace('admin', 'termini');
      }
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

  dataRefreshAux = function() {
    var qualified = [];
    for (var i = 0; i < RGZ.zakazaniTermini.length; i++) {
      if (RGZ.zakazaniTermini[i].salter != undefined) {
        if (!qualified.includes(RGZ.zakazaniTermini[i].salter.replace(/\s\s+/g, ' ').trim()))
          qualified.push(RGZ.zakazaniTermini[i].salter.replace(/\s\s+/g, ' ').trim());
      } else {
        if (!qualified.includes(RGZ.zakazaniTermini[i].kancelarija.replace(/\s\s+/g, ' ').trim()))
          qualified.push(RGZ.zakazaniTermini[i].kancelarija.replace(/\s\s+/g, ' ').trim());
      }
    }
    var scheduleCoHtml = `
      <option disabled hidden>ИЗАБЕРИТЕ ШАЛТЕР/КАНЦЕЛАРИЈУ...</option>
    `;
    var found = false;
    for (i = 0; i < qualified.length; i++) {
      if (qualified[i] == $("#schedule-co option:selected").val()) found = true;
      scheduleCoHtml += `<option ` + ((qualified[i] == $("#schedule-co option:selected").val()) ? `selected` : ``) + `>` + qualified[i] + `</option>`;
    }
    if (qualified.length == 0)
      scheduleCoHtml += `<option disabled>НЕМА ЗАКАЗАНИХ ТЕРМИНА</option>`;
    insertHtml("#schedule-co", scheduleCoHtml);
    if (found == false) {
      $("#schedule-co option:first-child").prop("selected", true);
    } else {
      RGZ.scheduleSearch();
    }
  };

  RGZ.scheduleRefresh = function(repeat) {
    $("#schedule-refresh i").addClass("fa-spin");
    setTimeout(function() {
      $("#schedule-refresh i").removeClass("fa-spin");
    }, 3000);
    RGZ.zakazaniTermini = [];
    var date = new Date();
    var day = ((date.getDate() < 10) ? "0" : "") + date.getDate();
    var month = ((date.getMonth() + 1 < 10) ? "0" : "") + (date.getMonth() + 1);
    var year = date.getFullYear();
    var sync = 2; /*(("" + year + "-" + month + "-" + day) == scheduleDateAux) ? 2 : 1;*/
    //if (("" + year + "-" + month + "-" + day) == scheduleDateAux)
      $ajaxUtils.sendGetRequest(
        RGZ.apiRoot + "korisnici/zakazaniTermini" + "?datum=" + encodeURIComponent(scheduleDateAux),
        function(responseArray, status) {
          for (var m = 0; m < responseArray.length; m++) {
            responseArray[m]["isOffice"] = false;
            RGZ.zakazaniTermini.push(responseArray[m]);
          }
          sync = sync - 1;
          if (sync == 0)
            dataRefreshAux();
        },
        true, RGZ.bearer
      );
    $ajaxUtils.sendGetRequest(
      RGZ.apiRoot + "korisnici/zakazaniTerminiKancelarije" + "?datum=" + encodeURIComponent(scheduleDateAux),
      function(responseArray, status) {
        for (var n = 0; n < responseArray.length; n++) {
          responseArray[n]["isOffice"] = true;
          RGZ.zakazaniTermini.push(responseArray[n]);
        }
        sync = sync - 1;
        if (sync == 0)
          dataRefreshAux();
      },
      true, RGZ.bearer
    );
    if (repeat == true) {
      setTimeout(function() {
        RGZ.scheduleRefresh(true);
      }, 600000);
    }
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
                      btnClass: 'btn-white-rgz',
                      keys: ['enter'],
                      action: function() {}
                    }
                  }
                });
              },
              true, RGZ.bearer
            );
          }
        }
      }
    });
  };

  RGZ.scheduleSearch = function() {
    disappear($("#timetable"), 500);
    //disappear($("#schedule-print, #schedule-print-1, #schedule-print-2"), 500);
    var ttHtml = `
      <div id="schedule-header" class="row">
        <div class="col-1"></div>
        <div class="col-2"><span class="hidden-sm-down">време</span><i class="hidden-md-up fa fa-clock-o"></i></div>
        <div class="col-6"><span class="hidden-sm-down">име и презиме</span><i class="hidden-md-up fa fa-user"></i></div>
        <div class="col-3"><span class="hidden-sm-down">потврда доласка</span><i class="hidden-md-up fa fa-minus-circle"></i><span class="hidden-md-up" id="slash">&nbsp;/&nbsp;</span><i class="hidden-md-up fa fa-check"></i><span class="hidden-md-up" id="slash">&nbsp;/&nbsp;</span><i class="hidden-md-up fa fa-times"></i></div>
      </div>
      <div id="schedule-items">
    `;
    //var itemCounter = 0;
    for (var i = 0; i < RGZ.zakazaniTermini.length; i++) {
      var salterTrim = (RGZ.zakazaniTermini[i].salter != undefined) ? RGZ.zakazaniTermini[i].salter.replace(/\s\s+/g, ' ').trim() : '';
      var kancelarijaTrim = (RGZ.zakazaniTermini[i].kancelarija != undefined) ? RGZ.zakazaniTermini[i].kancelarija.replace(/\s\s+/g, ' ').trim() : '';
      if (salterTrim == $("#schedule-co").val() || kancelarijaTrim == $("#schedule-co").val())
        ttHtml += `
          <div class="schedule-item row` + ((RGZ.zakazaniTermini[i].otkazan == true && $("#schedule-filter").hasClass("active") == false) ? ` zero-height` : ``) + /*((itemCounter % 2 == 0) ? ` odd` : `even`) +*/ `" id="item-` + i + `" onclick="$RGZ.scheduleItemClicked(` + i + `, this);">
            <div class="col-1 item-indicator"><i class="fa fa-circle pulse hidden"></i></div>
            <div class="col-2 item-time">` + RGZ.zakazaniTermini[i].termin + `</div>
            <div class="col-6 item-name">` + RGZ.zakazaniTermini[i].ime + `</div>
            <div class="col-1 item-c ` + ((RGZ.zakazaniTermini[i].otkazan == true) ? `arrival` : ((RGZ.zakazaniTermini[i].potvrda != null) ? `arrival-counter` : ``)) + `" onclick="$RGZ.cancelArrival(this, ` + RGZ.zakazaniTermini[i].id + `, ` + i + `, ` + RGZ.zakazaniTermini[i].isOffice + `);"><i class="fa fa-minus-circle"></i></div>
            <div class="col-1 item-y ` + ((RGZ.zakazaniTermini[i].potvrda == true) ? `arrival` : ((RGZ.zakazaniTermini[i].potvrda == false || RGZ.zakazaniTermini[i].otkazan == true) ? `arrival-counter` : ``)) + `" onclick="$RGZ.confirmArrival(this, ` + RGZ.zakazaniTermini[i].id + `, ` + i + `, ` + RGZ.zakazaniTermini[i].isOffice + `);"><i class="fa fa-check"></i></div>
            <div class="col-1 item-n ` + ((RGZ.zakazaniTermini[i].potvrda == false) ? `arrival` : ((RGZ.zakazaniTermini[i].potvrda == true || RGZ.zakazaniTermini[i].otkazan == true) ? `arrival-counter` : ``)) + `" onclick="$RGZ.confirmArrival(this, ` + RGZ.zakazaniTermini[i].id + `, ` + i + `, ` + RGZ.zakazaniTermini[i].isOffice + `);"><i class="fa fa-times"></i></div>
          </div>
          <div id="expansion-` + i + `" class="expansion collapse">
            <div class="row">
              <div class="expansion-info col-12">
                <div class="expansion-label">датум и време:</div>
                <div class="expansion-info-data">` + RGZ.zakazaniTermini[i].datum.substring(8, 10) + `.` + RGZ.zakazaniTermini[i].datum.substring(5, 7) + `.` + RGZ.zakazaniTermini[i].datum.substring(0, 4) + `. ` + RGZ.zakazaniTermini[i].termin + `</div>
                <div class="expansion-label">име и презиме:</div>
                <div class="expansion-info-data">` + RGZ.zakazaniTermini[i].ime + `</div>` + ((RGZ.zakazaniTermini[i].email != "" && RGZ.zakazaniTermini[i].email != null) ? `
                <div class="expansion-label">e-mail:</div>
                <div class="expansion-info-data">` + RGZ.zakazaniTermini[i].email + `</div>
                ` : ``) + ((RGZ.zakazaniTermini[i].tel != "" && RGZ.zakazaniTermini[i].tel != null) ? `
                <div class="expansion-label">телефон:</div>
                <div class="expansion-info-data">` + RGZ.zakazaniTermini[i].tel + `</div>
                ` : ``) + `
                <div class="expansion-label">документ:</div>
                <div class="expansion-info-data">` + RGZ.zakazaniTermini[i].dokument + `</div>` + ((RGZ.zakazaniTermini[i].otkazan == true) ? `
                <div class="expansion-label">разлог отказивања:</div>
                <div class="expansion-info-data">` + RGZ.zakazaniTermini[i].razlog_otkazivanja + `</div>
                ` : ``) + `
              </div>
            </div>
          </div>
        `;
        /*if (RGZ.zakazaniTermini[i].otkazan == true && $("#schedule-filter").hasClass("active"))
          itemCounter = itemCounter + 1;*/
    }
    ttHtml += `
      </div>
    `;
    setTimeout(function() {
      insertHtml("#timetable", ttHtml);
      updateTableOddity();
    }, 500);
    setTimeout(function() {
      appear($("#timetable"), 500);
      //appear($("#schedule-print, #schedule-print-1, #schedule-print-2"), 500);
      setTimeout(RGZ.currentClientIndicator, 10);
    }, 600);
  };

  RGZ.sknCancelSwitchSwitched = function() {
    otkazRazlog = $('#skn-cancel-select option:selected').val();
  };

  RGZ.cancelArrival = function(e, dbID, localID, isOffice) {
    confirmArrivalClicked = true;
    if ($(e).hasClass("arrival") || $(e).hasClass("arrival-counter")) {
      confirmArrivalClicked = false;
      return;
    }
    if (RGZ.loginInfo.rola == 3) {
      /*$.confirm({
        title: 'ГРЕШКА!',
        content: 'Немате привилегију за ову активност.',
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
      });*/
      return;
    }
    $.confirm({
      title: 'ПАЖЊА!',
      content: 'Да ли сте сигурни да желите да откажете овај термин?',
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
            otkazRazlog = 0;
            var switchHtml = `
              <select id="skn-cancel-select" onchange="$RGZ.sknCancelSwitchSwitched();">
                <option disabled value="0" selected hidden>ИЗАБЕРИТЕ РАЗЛОГ ОТКАЗИВАЊА...</option>
            `;
            for (var i = 0; i < RGZ.razloziOtkazivanja.length; i++)
              if (!(isOffice == false && RGZ.razloziOtkazivanja[i].id == 4))
                switchHtml += `<option value="` + RGZ.razloziOtkazivanja[i].id + `">` + RGZ.razloziOtkazivanja[i].razlog + `</option>`;
            switchHtml += `
              </select>
            `;
            $.confirm({
              title: 'РАЗЛОГ ОТКАЗИВАЊА',
              content: 'Овим вршите евидентирање разлога отказивања заказаног термина. Након потврде, одговарајући термин ће бити ослобођен за евентуално поновно заказивање.<br><br>Разлог:<br>' + switchHtml,
              theme: 'supervan',
              backgroundDismiss: 'true',
              buttons: {
                cancel: {
                  text: 'ОДУСТАНИ',
                  btnClass: 'btn-white-rgz',
                  keys: ['esc'],
                  action: function() {}
                },
                ok: {
                  text: 'ПОТВРДИ',
                  btnClass: 'btn-white-rgz',
                  keys: ['enter'],
                  action: function() {
                    if (otkazRazlog == 0)
                      $.confirm({
                        title: 'ГРЕШКА!',
                        content: 'Морате да одаберете разлог отказивања.',
                        theme: 'supervan',
                        backgroundDismiss: 'true',
                        buttons: {
                          ok: {
                            text: 'ОК',
                            btnClass: 'btn-white-rgz',
                            keys: ['enter'],
                            action: function() {
                              RGZ.cancelArrival();
                            }
                          }
                        }
                      });
                    else {
                      pleaseWait();
                      $ajaxUtils.sendPutRequest(
                        RGZ.apiRoot + "korisnici/otkaziTermin" + ((isOffice == true) ? "Kancelarije" : "") + "/" + dbID + "/" + otkazRazlog,
                        function(responseArray, status) {
                          if ($("#schedule-filter").hasClass("active") == false) {
                            if ($(e).parent().hasClass("expanded")) {
                              $(".schedule-item").removeClass("expanded");
                              $(".expansion").collapse('hide');
                            }
                            $(e).parent().addClass("zero-height");
                            setTimeout(function() {
                              updateTableOddity();
                            }, 10);
                          }
                          $(e).addClass("arrival");
                          $(e).parent().find(".item-y").addClass("arrival-counter");
                          $(e).parent().find(".item-n").addClass("arrival-counter");
                          RGZ.zakazaniTermini[localID].otkazan = true;
                          RGZ.zakazaniTermini[localID].razlog_otkazivanja = RGZ.razloziOtkazivanja.filter(function(data) { return data.id == otkazRazlog; }).razlog;
                          $(".jconfirm").remove();
                          $.confirm({
                            title: 'ТЕРМИН ОТКАЗАН',
                            content: 'Успешно сте отказали термин.',
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
                        },
                        true, RGZ.bearer
                      );
                    }
                  }
                }
              }
            });
          }
        }
      }
    });
  };

  RGZ.confirmArrival = function(e, dbID, localID, isOffice) {
    /*var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();*/
    confirmArrivalClicked = true;
    if ($(e).hasClass("arrival") || $(e).hasClass("arrival-counter")) {
      confirmArrivalClicked = false;
      return;
    }
    /*
    else if (hours * 100 + minutes - 5 < Number($(e).parent().find(".item-time").html().replace(':', ''))) { //TODO or later date
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
    */
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
            var data = JSON.parse(`{"id": ` + dbID + `, "potvrda": ` + (($(e).hasClass("item-y")) ? `true` : `false`) + `}`);
            data = JSON.stringify(data);
            pleaseWait();
            $ajaxUtils.sendPutRequestWithData(
              RGZ.apiRoot + "korisnici/potvrdaTermina" + ((isOffice == true) ? "Kancelarije" : "") + "/" + dbID,
              function(responseArray, status) {
                $(e).addClass("arrival");
                $(e).parent().find((($(e).hasClass("item-y")) ? ".item-n" : ".item-y")).addClass("arrival-counter");
                $(e).parent().find(".item-c").addClass("arrival-counter");
                RGZ.zakazaniTermini[localID].potvrda = (($(e).hasClass("item-y")) ? true : false);
                $(".jconfirm").remove();
                $.confirm({
                  title: 'ПОТВРЂЕН ' + (($(e).hasClass("item-y")) ? '' : 'НЕ') + 'ДОЛАЗАК',
                  content: 'Успешно сте забележили ' + (($(e).hasClass("item-y")) ? '' : 'не') + 'долазак клијента у заказаном термину.',
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
              },
              true, data, RGZ.bearer
            );
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

  /*RGZ.schedulePrint = function() {
    $.confirm({
      title: 'ПОТВРДА',
      content: `Уколико желите додатак наслову на документу за штампу, унесите га у ово поље:<br><br><input id="print-title" type="text" placeholder="наслов" onfocus="this.placeholder = ''" onblur="this.placeholder = 'наслов'">`,
      theme: 'supervan',
      backgroundDismiss: 'true',
      buttons: {
        cancel: {
          text: '<i class="fa fa-times"></i>',
          btnClass: 'btn-white-rgz',
          keys: ['esc'],
          action: function() {}
        },
        print: {
          text: '<i class="fa fa-print"></i>',
          btnClass: 'btn-white-rgz',
          keys: ['enter'],
          action: function() {
            var date = new Date();
            var day = ((date.getDate() < 10) ? "0" : "") + date.getDate();
            var month = ((date.getMonth() + 1 < 10) ? "0" : "") + (date.getMonth() + 1);
            var year = date.getFullYear();
            var hours = ((date.getHours() < 10) ? "0" : "") + date.getHours();
            var minutes = ((date.getMinutes() < 10) ? "0" : "") + date.getMinutes();
            var printTitle = RGZ.loginInfo.sluzba + " &bull; " + $("#schedule-co").val() + " &bull; " + RGZ.loginInfo.name + " &bull; " + day + `.` + month + `.` + year + `. ` + hours + `:` + minutes + (($("#print-title").val() != "") ? (" &bull; " + $("#print-title").val()) : "");
            var html4print = `
                <head><title>ЗАКАЗАНИ ТЕРМИНИ</title></head>
                <body>
                  <div class="print-title">` + printTitle + `</div>
                  <div class="header">
                    <div class="inner-s">&nbsp;&nbsp;&nbsp;време</div>
                    <div class="inner-xl">&nbsp;&nbsp;&nbsp;име и презиме</div>
                    <div class="inner-xl">&nbsp;&nbsp;&nbsp;документ / бр. предмета</div>
                    <div class="inner-xl">&nbsp;&nbsp;&nbsp;e-mail</div>
                    <div class="inner-l">&nbsp;&nbsp;&nbsp;телефон</div>
                    <div class="inner-l">потврда доласка</div>
                  </div>
                  <div class="print-items">
              `;
            for (var i = 0; i < RGZ.zakazaniTermini.length; i++)
              if (RGZ.zakazaniTermini[i].salter == $("#schedule-co").val() || RGZ.zakazaniTermini[i].kancelarija == $("#schedule-co").val())
                html4print += `
                    <div class="outer">
                      <div class="inner-s">&nbsp;&nbsp;&nbsp;` + RGZ.zakazaniTermini[i].termin + `</div>
                      <div class="inner-xl">&nbsp;&nbsp;&nbsp;` + RGZ.zakazaniTermini[i].ime + `</div>
                      <div class="inner-xl">&nbsp;&nbsp;&nbsp;` + RGZ.zakazaniTermini[i].dokument + `</div>
                      <div class="inner-xl">&nbsp;&nbsp;&nbsp;` + RGZ.zakazaniTermini[i].email + `</div>
                      <div class="inner-l">&nbsp;&nbsp;&nbsp;` + RGZ.zakazaniTermini[i].tel + `</div>
                      <div class="inner-xs">` + ((RGZ.zakazaniTermini[i].potvrda == true) ? `✔` : `&nbsp;`) + `</div>
                      <div class="inner-xs">` + ((RGZ.zakazaniTermini[i].potvrda == false) ? `✘` : `&nbsp;`) + `</div>
                    </div>
                `;
            html4print += `
                  </div>
                  <style>
                    body {
                      margin: 0;
                      -webkit-print-color-adjust: exact;
                    }
                    .header, .outer, .print-title {
                      position: relative;
                      width: 100%;
                      font-size: 65%;
                      overflow: auto;
                    }
                    .print-title {
                      text-align: center;
                      font-size: 75%;
                      font-weight: 600;
                      padding: 20px;
                    }
                    .header {
                      color: white;
                      font-weight: bold;
                      background-color: #444;
                      border-right: 1px solid #444;
                      border-left: 1px solid #444;
                    }
                    .print-items {
                      border: 1px solid #ddd;
                      border-top: 0;
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
                    .inner-xs, .header>div:last-child {
                      text-align: center !important;
                    }
                    .inner-xs {
                      width: calc(7.5% - 1px);
                      border-left: 1px solid #ddd;
                    }
                    .inner-s {
                      width: 10%;
                    }
                    .inner-l {
                      width: 15%;
                    }
                    .inner-xl {
                      width: 20%;
                    }
                  </style>
                </body>
              `;

            w = window.open("");
            w.document.write(html4print);
            w.print();
            w.close();
          }
        }
      }
    });
  };*/

  RGZ.currentClientIndicator = function() {
    var date = new Date();
    var day = ((date.getDate() < 10) ? "0" : "") + date.getDate();
    var month = ((date.getMonth() + 1 < 10) ? "0" : "") + (date.getMonth() + 1);
    var year = date.getFullYear();
    if (scheduleDateAux != ("" + year + "-" + month + "-" + day)) return;
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

  RGZ.logout = function() {
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
            sessionStorage.removeItem(RGZ.ssTokenLabel);
            location.reload();
          }
        }
      }
    });
  };

  global.$RGZ = RGZ;
})(window);