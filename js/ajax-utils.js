(function(global) {
  var ajaxUtils = {};

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

  function getRequestObject() {
    if (window.XMLHttpRequest) {
      return (new XMLHttpRequest());
    } else if (window.ActiveXObject) {
      return (new ActiveXObject("Microsoft.XMLHTTP"));
    } else {
      global.alert("Ajax is not supported!");
      return (null);
    }
  }

  ajaxUtils.sendGetRequest = function(requestUrl, responseHandler, isJsonResponse, bearer) {
    var request = getRequestObject();
    request.onreadystatechange = function() {
      handleResponse(request, responseHandler, isJsonResponse);
    };
    request.open("GET", requestUrl, true);
    if (bearer != null) request.setRequestHeader('Authorization', 'Bearer ' + bearer);
    request.send(null);
  };

  ajaxUtils.sendPostRequest = function(requestUrl, responseHandler, isJsonResponse, bearer) {
    var request = getRequestObject();
    request.onreadystatechange = function() {
      handleResponse(request, responseHandler, isJsonResponse);
    };
    request.open("POST", requestUrl, true);
    if (bearer != null) request.setRequestHeader('Authorization', 'Bearer ' + bearer);
    request.send(null);
  };

  ajaxUtils.sendPutRequest = function(requestUrl, responseHandler, isJsonResponse, bearer) {
    var request = getRequestObject();
    request.onreadystatechange = function() {
      handleResponse(request, responseHandler, isJsonResponse);
    };
    request.open("PUT", requestUrl, true);
    if (bearer != null) request.setRequestHeader('Authorization', 'Bearer ' + bearer);
    request.send(null);
  };

  ajaxUtils.sendDeleteRequest = function(requestUrl, responseHandler, isJsonResponse, bearer) {
    var request = getRequestObject();
    request.onreadystatechange = function() {
      handleResponse(request, responseHandler, isJsonResponse);
    };
    request.open("DELETE", requestUrl, true);
    if (bearer != null) request.setRequestHeader('Authorization', 'Bearer ' + bearer);
    request.send(null);
  };

  ajaxUtils.sendPostRequestWithData = function(requestUrl, responseHandler, isJsonResponse, data, bearer) {
    var request = getRequestObject();
    request.onreadystatechange = function() {
      handleResponse(request, responseHandler, isJsonResponse);
    };
    request.open("POST", requestUrl, true);
    if (bearer != null) request.setRequestHeader('Authorization', 'Bearer ' + bearer);
    request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    request.send(data);
  };

  ajaxUtils.sendPutRequestWithData = function(requestUrl, responseHandler, isJsonResponse, data, bearer) {
    var request = getRequestObject();
    request.onreadystatechange = function() {
      handleResponse(request, responseHandler, isJsonResponse);
    };
    request.open("PUT", requestUrl, true);
    if (bearer != null) request.setRequestHeader('Authorization', 'Bearer ' + bearer);
    request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    request.send(data);
  };

  function handleResponse(request, responseHandler, isJsonResponse) {
    if (request.readyState == 4) {
      if (request.status == 200 || request.status == 201 || request.status == 204) {
        if (isJsonResponse == undefined)
          isJsonResponse = true;
        if (isJsonResponse)
          responseHandler(JSON.parse((request.status == 204) ? null : request.responseText), request.status);
        else
          responseHandler((request.status == 204) ? null : request.responseText, request.status);
      } else if (request.status == 400 || request.status >= 500) {
        var errorText = JSON.parse(request.responseText).Message;
        setTimeout(function() {
          disappear($(".content-box-loader"), 200);
        }, 500);
        $(".jconfirm").remove();
        $("input, select").prop("disabled", false);
        $.confirm({
          title: 'ГРЕШКА!',
          content: errorText,
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
          disappear($(".content-box-loader"), 200);
        }, 500);
        $(".jconfirm").remove();
        $("input, select").prop("disabled", false);
        opzEnabled = true;
        $.confirm({
          title: 'ГРЕШКА!',
          content: 'Десила се грешка у систему, покушајте поново касније.<br><br><span>Како би услуга била омогућена, потребно је користити новије верзије интернет претраживача (препоручени су Chrome, Firefox, Edge и сл. са почетка 2016. године или новији).</span>',
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
    }
  };

  global.$ajaxUtils = ajaxUtils;
})(window);