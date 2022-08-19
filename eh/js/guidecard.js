'use strict';

$(function() {
    
    document.title = "포옹전 작품 가이드 | APLX";
    eventOC_IN();    
    window.onbeforeunload = function (e) {    
        eventOC_OUT();
        return undefined;   
    };
    updateMindSet();    

    setTimeout(function(){
        // This hides the address bar:
        window.scrollTo(0, 1);
    }, 0);
});  

var targetFileId = 470;
var currentPostId = -1;
var jobIds = [496, 517];
var commentArrayData = [];
var pageContents = [];
var currrentPage = 0;
var currentCommentCount = 0;
var hideTimeout = -1, showTimeout = -1;

var intervalHandle = null;
var isStop = true;

function updateMindSet() {
    var mindFileName = targetFileId + ".mind";
    $('#front_image').attr("src", "./assets/ex/targets/" + targetFileId + ".jpg");

    setARContent(mindFileName);

    const setButtons = () => {
        mSel("#bird1_button").addEventListener('click', function (evt) {       
            setFirstPage();
        });

        mSel("#bird2_button").addEventListener('click', function (evt) {       
            setSecondPage();
        });

        mSel("#qrscan_button").addEventListener('click', function (evt) {       
            playSound(1);
            return;
        });

        mSel("#like_button").addEventListener('click', function (evt) {
            likeMessage();
        });

        mSel("#write_comment_button").addEventListener('click', function (evt) {
            mSel("#bottom_border").style.display = 'none';
            mSel("#top_border").style.display = 'none';
            $("#area_comment_writer").show();
        });

        mSel("#closeButton").addEventListener('click', function(evt) {
            mSel("#bottom_border").style.display = 'block';
            mSel("#top_border").style.display = 'block';
            $("#area_comment_writer").hide();
        });

        mSel("#replyButton").addEventListener('click', function(evt) {            
            writeMessage();            
        });

    };

    const showPortfolio = () => {
        const portfolio = document.querySelector("#portfolio-panel");
        portfolio.setAttribute("visible", true);  
    };            

    const sceneEl = document.querySelector('a-scene');
    sceneEl.addEventListener('targetFound', event => {      
        mSel("#bottom_border").style.display = 'block';
        showPortfolio();
        startHistoryScroll();
    });
        
    sceneEl.addEventListener('targetLost', event => {
        //mSel("#bottom_border").style.display = 'none';
        pauseScroll();
    });

    $("#oScroll").height(window.innerHeight - 238);
    setButtons();
    showComment();
    get_messages();
}

function setARContent(mindFileName) {
    var strContent = '<a-scene loading-screen="dotsColor: red; backgroundColor: black" mindar-image="imageTargetSrc: ./assets/ex/targets/' + mindFileName + '; showStats: false; uiScanning: #example-scanning-overlay; filterMinCF:0.0001; filterBeta: 0.001;" embedded color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false"> \
      \
      <a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false; rayOrigin: mouse;" raycaster="far: 10000; objects: .clickable"></a-camera> \
      \
      <a-entity id="card-object-target" mindar-image-target="targetIndex: 0"> \
        <a-entity visible=false id="portfolio-panel" position="0 0 0"> \
          <a-image id="over_image" position="0 0 0.02" width="1.02" height="1.02"></a-image> \
        </a-entity> \
      </a-entity> \
    </a-scene>';

    $('#example-container').append(strContent);    
}

function playSound(id) {
    try {
        if (id == 1)
            new Audio("./assets/ex/button.wav").play();
        else
            new Audio("./assets/ex/like.wav").play();
    }
    catch(e) {

    }
}

function setPageAssets(docu_id) {
    currentPostId = docu_id;

    var curContent = pageContents[currentPostId];    
    commentArrayData = curContent.comments;
    
    mSel("#over_image").setAttribute("src", curContent.filename);

    var ratio = curContent.height / curContent.width;
    mSel("#over_image").setAttribute("height", ratio + 0.02);
    mSel("#over_image").setAttribute("width", 1.02);

    mSel("#comment_a1").innerHTML = curContent.title;
    mSel("#comment_a2").innerHTML = curContent.content;    

    setLikeButtonStatus(currentPostId);    
}


function setFirstPage() {
    currrentPage = 0;
    playSound(1);
    pauseScroll();    
    setPageAssets(517);
    startHistoryScroll();
}


function setSecondPage() {
    currrentPage = 1;
    playSound(1);
    pauseScroll();
    setPageAssets(496);
    startHistoryScroll();
}

function setLikeButtonStatus(docu_id) {
    if (getCookie("user_like_" + docu_id) == "liked") {
        mSel("#like_button").setAttribute("src", ""); 
        mSel("#like_button").setAttribute("src", "./assets/icon_heart.png");
        return;
    }    
  
    mSel("#like_button").setAttribute("src", ""); 
    mSel("#like_button").setAttribute("src", "./assets/ex/icon_heart1@3x.png");
}

function likeMessage()  {
  if (getCookie("user_like_" + currentPostId) == "liked") {
      setCookie("user_like_" + currentPostId, "", 1);
      likeCancelMessage(currentPostId);
      mSel("#like_button").setAttribute("src", ""); 
      mSel("#like_button").setAttribute("src", "./assets/ex/icon_heart1@3x.png"); 
      return;
  }

  playSound(0);
  setCookie("user_like_" + currentPostId, "liked", 1);
  mSel("#like_button").setAttribute("src", "");
  mSel("#like_button").setAttribute("src", "./assets/icon_heart.png");

  var formData = new FormData();
  formData.append("form_kind", "like_action");
  formData.append("user", "eh");
  formData.append("docu_srl", currentPostId);    

  ajaxRequest(formData, function (r) {    
    }, function (r,s,e) {                
  });
}

function likeCancelMessage(docu_id)  {

  var formData = new FormData();
  formData.append("form_kind", "like_action_cancel");
  formData.append("user", "eh");
  formData.append("docu_srl", docu_id);    

  ajaxRequest(formData, function (r) {        
    }, function (r,s,e) {        
  });

}


var currentJobIndex = 0;
function get_messages() {

  var docu_id = jobIds[currentJobIndex];
  currentJobIndex++;

  var formData = new FormData();
  formData.append("form_kind", "get_message");
  formData.append("user", "eh");
  formData.append("tag", "1");
  formData.append("docu_srl", docu_id);

  ajaxRequest(formData, function (r) {        
    if (isSet(r) && r.length > 0) {                   
        
        var commentArray = [];
        if ("comments" in r[0] && r[0].comments.length > 0) {            
            r[0].comments.forEach(function (v, i, arr) {                
                commentArray.push(v.content + " | " + v.name);                
            });            
        }

        pageContents[docu_id] = {title : r[0].title, content : r[0].content, filename : r[0].file, comments : commentArray, width:r[0].width, height:r[0].height};

        if (currentJobIndex < jobIds.length) {
            get_messages();            
        }
        else {
            setFirstPage();
        }
    }

    }, function (r,s,e) {

  });
}


function showComment() {    
    if (commentArrayData.length <= 0) {
        hideTimeout = window.setTimeout(hideComment, 1000);
        return;
    }

    if (currentCommentCount >= commentArrayData.length) currentCommentCount = 0;    
    var textToShow = commentArrayData[currentCommentCount];
    currentCommentCount++;

    if (textToShow.length > 28) {
        textToShow = textToShow.substring(0, 28);
        textToShow += " ...";
    }

    mSel("#comment_area").innerHTML = textToShow + " <img src='./assets/icon_heart.png' width='8px'>";
    mSel("#comment_area").classList.remove("fade");
    
    hideTimeout = window.setTimeout(hideComment, 3500);
}

function hideComment() {    
    mSel("#comment_area").classList.add("fade");
    showTimeout = window.setTimeout(showComment, 1000);
}


function writeMessage()  {
    var comment = $("#commentInput").val();
    var name = $("#nameInput").val();

    if (!isSet(comment) && comment == "") {
        alert("댓글을 작성해 주세요 :)");
        return;
    }

    if (comment.length > 25) {
        alert("댓글의 길이가 너무 길어요. 25자 이내로 굵고, 짧게 작성 부탁드려요 :)");
        return;
    }

    if (!isSet(name) && name == "") {
        alert("이름을 작성해 주세요 :)");
        return;
    }

    if (name.length > 10) {
        alert("이름의 길이가 너무 길어요. 10자 이내로 작성 부탁드려요 :)");
        return;
    }
 
    var formData = new FormData();
    formData.append("form_kind", "write_comment");
    formData.append("user", 'eh');
    formData.append("docu_srl", currentPostId);
    formData.append("comment", comment);
    formData.append("name", name);

    ajaxRequest(formData, function (r) {        
        commentArrayData.unshift(comment + " | " + name);        
        $("#area_comment_writer").hide();
        mSel("#bottom_border").style.display = 'block';
        mSel("#top_border").style.display = 'block';
        alert("감사합니다. 즐거운 관람 되세요!");
    }, function (r,s,e) {
        $("#area_comment_writer").hide();
        mSel("#bottom_border").style.display = 'block';
        mSel("#top_border").style.display = 'block';
        alert("작성 실패! - 잠시 후 다시 시도해 주세요.")
    });
}

function pauseScroll() {
    if(isStop == true) {        
        return;
    }

    isStop = true;
    clearInterval(intervalHandle);
    $("#scroll").scrollTop( 0 );
    $("#oScroll").scrollTop( 0 );
    vScroll = null;
}

function resumeScroll() {
    isStop = false;
    intervalHandle = setInterval("vScroll.move()", 30);
}

function scroll(oid, iid) {
    this.oCont = document.getElementById(oid);
    this.ele = document.getElementById(iid);
    this.height = this.ele.clientHeight;
    this.n = this.oCont.clientHeight;
    this.move = function () {
        this.ele.style.top = this.n + "px";
        this.n--;
    }
}
var vScroll;
function startHistoryScroll() {
    isStop = false;
    vScroll = new scroll("oScroll", "scroll");
    intervalHandle = setInterval("vScroll.move()", 30)
}