
window.onload = () => {
        initViewer();        
};

let isCommentAreaVisible = false;
let currentContentId = -1;
let currentContentImage = "";
let currentMemo = "";
let currentLat, currentLng, currentAlt;
let oldLat = -999, oldLng = -999, oldAlt = -999;

function initViewer() {    
    $("#commentArea").hide();
    $("#replyButton").click(function() {
        writeComment();
    });

    $("#closeBtn").click(function () {
        $("#commentArea").hide();
    });

    AFRAME.registerComponent('click-handler', {
        schema: {
            txt: {default:'default'}
            }, 
        init: function() {            
            this.el.addEventListener('click', clickListener);
        }
    });    

    getLocationData();
}

const getLocationData = function () {
        navigator.geolocation.getCurrentPosition(function (position) {            
                checkCurrentLocation(position);
                setTimeout("getLocationData()", 2000);
            },
            (err) => {
                //console.error('Error in retrieving position', err);
                setTimeout("getLocationData()", 2000);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000,
            }
        );
};


const checkCurrentLocation = function (position) {
    currentLat = position.coords.latitude;
    currentLng = position.coords.longitude;
    currentAlt = position.coords.altitude;

    if (oldLat == -999
        || Math.abs(currentLat - oldLat) > 0.0005
        || Math.abs(currentLng - oldLng) > 0.0005        
        ) {
        dynamicLoadPlaces();        
    }

    oldLat = currentLat;
    oldLng = currentLng;
    oldAlt = currentAlt;
}

const clickListener = function(ev, target) {
    ev.stopPropagation();
    ev.preventDefault();

    currentMemo = ev.target.getAttribute('memo');
    currentContentId = ev.target.getAttribute('id');
    currentContentImage = ev.target.getAttribute('content_image');
    
    const el = ev.detail.intersection && ev.detail.intersection.object.el;

    if (el && el === ev.target) {
        const label = document.createElement('span');
        const container = document.createElement('div');
        container.setAttribute('id', 'place-label');
        label.innerText = currentMemo;
        container.appendChild(label);
        document.body.appendChild(container);
        
        setTimeout(() => {
            container.parentElement.removeChild(container);
        }, 1500);

        if (isCommentAreaVisible == true) {
            isCommentAreaVisible = false;
            $('#commentArea').hide();
        }

        setTimeout(() => {
            getReplyContent();
        }, 0);

    }
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

function showComments(comments) {
    if (comments && comments.length > 0) {
        
    }   
    
    isCommentAreaVisible = true;

    $('#commentArea').show();
    $('#commentReplyArea').empty();


    let contentRow = "<div class='row'><div class='col-12 text-center'>"
                        + "<img src='https://duni.io/arink/cs/images/" + currentContentImage + "' border=0 width='150px'>"
                        + "<br>" + currentMemo
                        + "<br><br></div></div>";
    
    comments.forEach((d) => {
        let imageContent = "";
        if ("image" in d && d.image != "") {
            imageContent = "<img src='/cs/assets/" + d.image + ".png' border='0' width='16px' height='16px'>";
        }

        contentRow += "<div class='row'>"
            + "<div class='col-2 text-center'>"
            + imageContent
            + "</div><div class='col-10 text-left'>"
            + d.comment
            + "</div>"            
            + "</div><div class='row'><hr size='1' width='90%' color='#aaa'></div>";        
    });

    $('#commentReplyArea').append(contentRow);   
}

function writeComment() {
    let comment = $("#commentInput").val();
    if (comment == "") {
        alert("내용을 입력해 주5");
        return;
    }

    let fd = new FormData();
    fd.append('user_id', 1324);
    fd.append('form_kind', 'write');
    fd.append('c_id', currentContentId);
    fd.append('c_image', getCookie("temp_image"));
    fd.append('comment', comment);
    $.ajax({
        type: 'POST',
        url: 'https://duni.io/arink/cs/handler/handler.php',
        data: fd,
        cache: false,
        processData: false,
        contentType: false                                                    
    }).done(function(data) {
        $("#commentInput").val("");
        setTimeout(() => {
            getReplyContent();
        }, 0);
    });
}

function getReplyContent() {
    if (currentContentId < 0) return;

    var fd = new FormData();
    fd.append('user_id', 1324);
    fd.append('form_kind', "comment");
    fd.append('c_id', currentContentId);    
    $.ajax({
        type: 'POST',
        url: 'https://duni.io/arink/cs/handler/handler.php',
        data: fd,
        cache: false,
        processData: false,
        contentType: false                                                    
    }).done(function(data) {
        showComments(data.data); 
    });
}

// getting places from REST APIs
function dynamicLoadPlaces() {
    var fd = new FormData();
    fd.append('user_id', 1324);
    fd.append('form_kind', "get");
    fd.append('lat', currentLat);
    fd.append('lng', currentLng);
    let alt = currentAlt;
    if (alt == null) alt = 0;    
    fd.append('alt', alt);
    $.ajax({
        type: 'POST',
        url: 'https://duni.io/arink/cs/handler/handler.php',
        data: fd,
        cache: false,
        processData: false,
        contentType: false                                                    
    }).done(function(data) {
        // todo:
        // redirection
        renderPlaces(data.data); 
    });
};

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    if (places && places.length > 0) {
            $("#topText").text("Loaded : " + places.length);
    }    

    places.forEach((d) => {
        let latitude = d.lat;
        let longitude = d.lng;

        // add place name
        let objet = document.createElement('a-entity');
        objet.setAttribute('id', d.id);
        objet.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);                
        objet.setAttribute('scale', '0.4 0.4 0.4');
        objet.setAttribute('gltf-model', '/cs/assets/dog.glb');
        objet.setAttribute('memo', d.memo);
        objet.setAttribute('rotation', '0 90 0');
        objet.setAttribute('animation-mixer', '');
        objet.setAttribute('content_image', d.filename);
        objet.setAttribute("click-handler", "txt:image");
        objet.setAttribute("cursor", "rayOrigin:mouse");
        objet.setAttribute("smooth", "10");
        objet.setAttribute("smoothCount", "0.01");
        objet.setAttribute("smoothThreshold", "5");        
         
        objet.addEventListener('loaded', () => {
            window.dispatchEvent(new CustomEvent('gps-entity-place-loaded', { detail: { component: this.el }}));
        });

        scene.appendChild(objet);        
    });

    
}