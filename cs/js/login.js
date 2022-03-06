"use strict";
  
window.onload = () => {
    
};

function googleinit() {
  if ((typeof gapi) === "undefined" || gapi == null || gapi == "") {
      return;
  }

  gapi.load('auth2', function () { // Ready.
      let gauth = gapi.auth2.init();

      let options = new gapi.auth2.SigninOptionsBuilder();
      options.setPrompt('select_account');

      gauth.attachClickHandler(document.getElementById('googleLoginBtn'), options,
          function (googleUser) {
            setCookie("dev_kind", "google", 1);

            var profile = googleUser.getBasicProfile();
            var token = googleUser.getAuthResponse().id_token;
        
            var name = profile.getName();
            var image = profile.getImageUrl();
            var email = profile.getEmail();
            formSubmit(token, name, image, email);
          }, function (error) {
              //alert(JSON.stringify(error, undefined, 2));
      });
  });
}

function signOut() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
      delCookie("dev_kind");
    });  
}

function formSubmit(token, temp_name, temp_image, temp_email) {
    showLoader();

    if (isSet(temp_name) == false) {
        temp_name = "";
    }

    if (isSet(temp_email) == false) {
        temp_email = "";
    }

    if (isSet(temp_image) == false) {
        temp_image = "";
    }

    let skind = getCookie("dev_kind");

    let fd = new FormData();  
    fd.append('form_kind', 'login');  
    fd.append('sns_kind', skind);
    fd.append('sns_id', token);
    fd.append('nickname', temp_name);
    fd.append('email', temp_email);
    fd.append('image', temp_image);
    $.ajax({
        type: 'POST',
        url: 'https://duni.io/arink/cs/handler/handler.php',
        data: fd,
        cache: false,
        processData: false,
        contentType: false                                                    
    }).done(function(data) {
        if (data.result_code != 0) {
            if (data.reason == "not registered") {
              setCookie("temp_sns_id", token, 1);
              setCookie("temp_name", temp_name, 1);
              setCookie("temp_email", temp_email, 1);
              setCookie("temp_image", temp_image, 1);
              showConfirmDialog();
              return;
            }
        }

        $("#loginArea").hide();        
    });
}

function tryRegister() {

  let sns_id = getCookie("temp_sns_id");
  let temp_name = getCookie("temp_name");
  let temp_email = getCookie("temp_email");
  let temp_image = getCookie("temp_image");
  let skind = getCookie("dev_kind");

  let fd = new FormData();  
  fd.append('form_kind', 'register');  
  fd.append('sns_kind', skind);
  fd.append('sns_id', sns_id);
  fd.append('nickname', temp_name);
  fd.append('email', temp_email);
  fd.append('image', temp_image);
  $.ajax({
      type: 'POST',
      url: 'https://duni.io/arink/cs/handler/handler.php',
      data: fd,
      cache: false,
      processData: false,
      contentType: false                                                    
  }).done(function(data) {
      if (data.result_code != 0) {
        showAlert("죄송합니다, 회원가입이 실패하였습니다 : " + data.reason);
        return;    
      }

      showAlert("축하드립니다. 성공적으로 가입되었습니다.");
      $("#loginArea").hide();        
  });
}
