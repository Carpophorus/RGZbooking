(function(global) {
  var ajaxUtils = {};

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
    request.setRequestHeader('Authorization', 'Bearer ' + bearer);
    request.send(null);
  };

  ajaxUtils.sendPostRequest = function(requestUrl, responseHandler, isJsonResponse, bearer) {
    var request = getRequestObject();
    request.onreadystatechange = function() {
      handleResponse(request, responseHandler, isJsonResponse);
    };
    request.open("POST", requestUrl, true);
    request.setRequestHeader('Authorization', 'Bearer ' + bearer);
    request.send(null);
  };

  ajaxUtils.sendPostRequestWithData = function(requestUrl, responseHandler, isJsonResponse, data, bearer) {
    var request = getRequestObject();
    request.onreadystatechange = function() {
      handleResponse(request, responseHandler, isJsonResponse);
    };
    request.open("POST", requestUrl, true);
    request.setRequestHeader('Authorization', 'Bearer ' + bearer);
    request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    request.send(data);
  };

  function handleResponse(request, responseHandler, isJsonResponse) {
    if (request.readyState == 4) {
      if (request.status == 200) {
        if (isJsonResponse == undefined)
          isJsonResponse = true;
        if (isJsonResponse)
          responseHandler(JSON.parse(request.responseText), request.status);
        else
          responseHandler(request.responseText, request.status);
      } else {
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
    }
  };

  global.$ajaxUtils = ajaxUtils;
})(window);