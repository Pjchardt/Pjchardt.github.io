---
layout: poca_layout
title:  "poca_blob"
---
<head>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@0.10.2/lib/p5.js"></script>
    <link rel="stylesheet" href="{{ site.baseurl }}/assets/styles/blog.css">
    <script src="{{ site.baseurl }}/assets/javascript/gif.worker.js"></script> 
    <script src="{{ site.baseurl }}/assets//javascript/Dulaunay.js"></script>
    <script src="{{ site.baseurl }}/assets/javascript/p5js_sketch_3.js"></script>
</head>

<script type="text/javascript" src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>

<style>
    .center-screen {
        position: absolute;
        width:50%;
        height:auto;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
    }
    .canvas-style {
        max-width: 100%;
        height: auto !important;
    }
</style>

<!-- Script -->
<script type='text/javascript'>
    //grab the context from your destination canvas
    var dest_ctx = null;// = destinationCanvas.getContext('2d');
    function screenshot(){
        html2canvas(document.body).then(function(canvas) {
            var ctx = canvas.getContext('2d');
            
            //grab the context from your destination canvas
            if (dest_ctx == null) {
                dest_ctx = ctx;
                //dest_ctx.scale(.5,.5);
                //canvas.style.width = 960;
                //canvas.style.height = 540;
                canvas.className += 'canvas-style' 
                console.log('appending canvas');
                document.getElementById('canvas-container').appendChild(canvas);
            }
            else {
                console.log("copying canvas");
                dest_ctx.drawImage(canvas, 0, 0);
                canvas = null;
            }
        });
    }
    setInterval(screenshot, 2000)
</script>

<div>
    <div class="container" style="max-width: 100%; margin-top: -30px; padding-top: 50px; padding-bottom: 50px;">
        <div class="row">
            <div class="col">
                <input type='button' id='but_screenshot' value='Take screenshot' onclick='screenshot();'><br/>
                <div class="col">
                    <img src="{{ site.baseurl }}/images/poca/vaporwave_glitch_1.gif" alt="vaporwave glitch">
                </div>
            </div>
            <div class="col">
                <div class="slidecontainer">
                    <input type="range" min="0" max="360" value="0" class="slider" id="myRange">
                </div>
            </div>
        </div>
    </div>
</div>

<div class="p5js pb-4 pt-2" id="sketch-holder">
      <!-- Our sketch will go here! -->
</div>

<div class='canvas-container center-screen' id='canvas-container'>

</div>

<script>
var slider = document.getElementById("myRange");

slider.oninput = function() {
    var div = document.getElementById('canvas-container');
    deg = this.value;

    div.style.webkitTransform = 'translate(-50%, -50%) rotate('+deg+'deg)'; 
    div.style.mozTransform    = 'translate(-50%, -50%) rotate('+deg+'deg)'; 
    div.style.msTransform     = 'translate(-50%, -50%) rotate('+deg+'deg)'; 
    div.style.oTransform      = 'translate(-50%, -50%) rotate('+deg+'deg)'; 
    div.style.transform       = 'translate(-50%, -50%) rotate('+deg+'deg)'; 
}
</script>