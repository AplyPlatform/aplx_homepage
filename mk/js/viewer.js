
$(function(){ 
  updateMindSet();

  AFRAME.registerComponent('button', {
    init: function() {

        const gltf = document.querySelector('#animatedApple');
        var x = gltf.getAttribute('scale').x;
        var y = gltf.getAttribute('scale').y;
        var z = gltf.getAttribute('scale').z;

        // every click, we make our model grow in size :)
        gltf.addEventListener('click', function(ev, target){
            console.log(gltf.getAttribute('scale'));
            gltf.setAttribute('scale', x + " " + y + " "+ z);
            x += 0.1;
            y += 0.1;
            z += 0.1;
        });
    }
  });

  function updateMindSet() {
    let mindStr = '<div><a-scene loading-screen="dotsColor: red; backgroundColor: black" mindar-image="imageTargetSrc: ./assets/target.mind;"';

    let bodyStr = mindStr
                  + ' color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false"><a-assets></a-assets>'
                  + '<a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false; rayOrigin: mouse;" raycaster="far: 10000; objects: .clickable"></a-camera>'
                  + '<a-entity mindar-image-target="targetIndex: 0">'
                  + '<a-plane id="aplane" class="clickable" geometry="primitive:plane;width:0.98;height:1.38;" position="0 0 0" material="shader:gif;src:url(./assets/out.gif);opacity:1.0"></a-plane>'
                  + '</a-entity></a-scene></div>';
    bodyStr += '<div id="flipButton"><font size="1" color="white">© 2022 <a href="https://aply.biz" target="_blank"><img src="../assets/images/logo_white.png" border="0" width="25px"></a></font></div>';

    $('body').html(bodyStr);

    const portfolio = document.querySelector("#aplane");
    portfolio.addEventListener('click', function (evt) {
      window.open("https://rooftopartist.com/");
    });
  }
});    