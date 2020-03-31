---
layout: poca_layout
title:  "poca_blob"
---

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Unity WebGL Player | blob</title>
    <link rel="shortcut icon" href="TemplateData/favicon.ico">
    <link rel="stylesheet" href="TemplateData/style.css">
    <script src="TemplateData/UnityProgress.js"></script>
    <script src="Build/UnityLoader.js"></script>
    <script>
        var unityInstance = UnityLoader.instantiate("unityContainer", "Build/builds.json", {onProgress: UnityProgress});
    </script>
</head>

<div class="col">
    <img src="{{ site.baseurl }}/images/poca/vaporwave_glitch_1.gif" style="width:100%; filter: brightness(0.2);" alt="vaporwave glitch">
</div>

<div class="webgl-content">
    <div id="unityContainer" style="width: 1280px; height: 720px"></div>
    <div class="footer">
        <div class="fullscreen" onclick="unityInstance.SetFullscreen(1)"></div>
        <div class="title" style="color: grey;">warning: strobing effects</div>
    </div>
</div>
