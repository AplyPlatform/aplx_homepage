
  let lat, lng, alt;
  let currentBlob;

  $(function() {
    // first get current user location
    setDefaultUIStatus();
    imageCropperSetup();
    
    navigator.geolocation.getCurrentPosition(function (position) {
        // than use it to load from remote APIs some places nearby

        lat = position.coords.latitude;
        lng = position.coords.longitude;
        alt = position.coords.altitude;
        setDefaultUIStatus();
        
      },
      (err) => console.error('Error in retrieving position', err),
      {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 27000,
      }
    );
    
    setServiceWorker();    
  });

  const setDefaultUIStatus = () => {    
    $("#progressArea").hide();
    $("#fileDropArea").show();
    $("#progress-bar").css("width", "0%");
  };
    
  const uploadToServer = (blob) => {

    let reader = new FileReader();
    reader.onload = function(event) {
        showLoader();
        let sns_id = getCookie("temp_sns_id");
        let skind = getCookie("dev_kind");
        let user_token = getCookie("user_token");
        let temp_image = getCookie("temp_image");
        let client_id = getCookie("user_clientid");

        let fd = new FormData();        
        fd.append('form_kind', "upload");
        fd.append('lat', lat);
        fd.append('lng', lng);        
        if (alt == null) alt = 0;
        fd.append('alt', alt);
        fd.append('c_image', temp_image);
        fd.append('sns_id', sns_id);        
        fd.append('sns_kind', skind);
        fd.append('user_token', user_token);
        fd.append("client_id", client_id);
        fd.append('fileext', "png");        
        fd.append('memo', $("#memoInput").val());
        fd.append('data', event.target.result);
        $("#progressArea").show();
        $.ajax({
            type: 'POST',
            url: 'https://duni.io/arink/cs/handler/handler.php',
            data: fd,
            processData: false,
            contentType: false,
            xhr: function() {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function(e) {
                  var percent = e.loaded * 100 / e.total;
                  setProgress(percent);
                };
                return xhr;
            }                                          
        }).done(function(data) {               
            if (data.result_code != 0) {         
              showAlert("????????? ?????????????????????, ?????? ??? ?????? ????????? ?????????. (?????? ???????????? ??? ?????????)");
              hideLoader();
              return;
            }            
            location.href = "https://arink.aply.biz/cs/viewer.html";
        }).fail(function()  {            
            alert("Sorry. Server unavailable. ");
            hideLoader();            
        }); 
    };

    reader.readAsDataURL(blob);
  }

  function uploadBlobData(blob) {
    if (!isSet(blob)) {
      showAlert("????????? ??????????????? ?????? ????????? ????????? ?????????!");
      return;
    }
    
    let memo = $("#memoInput").val();
    if (!isSet(memo)) {
      showAlert("?????? ????????? ????????? ???????????????~^^");
      return;
    }
    
    let token = getCookie("user_token");
    if (!isSet(token)) {
      showAlert("???????????? ????????? ???????????? ??? ????????? :)");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(function (position) {
        // than use it to load from remote APIs some places nearby
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        alt = position.coords.altitude;        
        $("#fileDropArea").hide();
        $("#progressArea").show();
        $("#progress").text("???????????????, ?????????!");          
        uploadToServer(blob);
      },
      (err) => console.error('Error in retrieving position', err),
      {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 27000,
      }
    ); 
  }

function imageCropperSetup() {

    var avatar = document.getElementById('avatar');
    var image = document.getElementById('image');
    var input = document.getElementById('inputimage_file');    
    var $alert = $('.alert');
    var $modal = $('#modal');
    var cropper;

    $('[data-toggle="tooltip"]').tooltip();

    input.addEventListener('change', function (e) {
      var files = e.target.files;
      var done = function (url) {
        input.value = '';
        image.src = url;
        $alert.hide();
        $modal.modal('show');
      };
      var reader;
      var file;
      if (files && files.length > 0) {
        file = files[0];

        if (URL) {
          done(URL.createObjectURL(file));
        } else if (FileReader) {
          reader = new FileReader();
          reader.onload = function (e) {
            done(reader.result);
          };
          reader.readAsDataURL(file);
        }
      }
    });

    $modal.on('shown.bs.modal', function () {
      cropper = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 3,
      });
    }).on('hidden.bs.modal', function () {
      cropper.destroy();
      cropper = null;
    });

    document.getElementById('crop').addEventListener('click', function () {      
      var canvas;

      $modal.modal('hide');

      if (cropper) {
        canvas = cropper.getCroppedCanvas({
          width: 800,
          height: 800,
        });
        initialAvatarURL = avatar.src;
        avatar.src = canvas.toDataURL();
        $alert.removeClass('alert-success alert-warning');
        
        canvas.toBlob(function (blob) {
          currentBlob = blob;
        });        
      }
    });
}

document.getElementById("startButton").addEventListener("click", function() {
    uploadBlobData(currentBlob);
});

function setServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/cs/sw.js', {scope: '/cs/'})
      .then(() => { 
        console.log('Service Worker Registered');         
      })
      .catch(function(error) {
        // registration failed
        console.log('Registration failed with ' + error);
      });    
  }

  let deferredPrompt;
  const addBtn = document.querySelector('.add-button');
  addBtn.style.display = 'none';

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    addBtn.style.display = 'block';

    addBtn.addEventListener('click', () => {
      // hide our user interface that shows our A2HS button
      addBtn.style.display = 'none';
      // Show the prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the Calming Signal prompt');
        } else {
          console.log('User dismissed the Calming Signal prompt');
        }
        deferredPrompt = null;
      });
    });
  });
}


// Code to handle install prompt on desktop


