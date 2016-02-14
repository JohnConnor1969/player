var events;
var jsPingDate,flashPingDate, jsLoadDate, flashLoadDate;
var lastSeekingIdx,lastFragPlayingIdx;
var api;
var levels;


function loadStream(url) {
    api.stop();
    load(url);
    $('#streamURL').val(url);
    var hlsLink = document.URL.split('?')[0] +  '?src=' + encodeURIComponent(url);
    var description = 'permalink: ' + "<a href=\"" + hlsLink + "\">" + hlsLink + "</a>";
    $("#StreamPermalink").html(description);
}

function appendLog(txt)
{
    var d = new Date();
    var msg = '[' + d.toString() + '] ' + txt;
    console.log(msg);
    $('#VideoStatus').append(msg + "<br>");
}

function load(url) {
    jsLoadDate = new Date();
    flashLoadDate = (jsLoadDate - jsPingDate )+ flashPingDate;
    lastSeekingIdx = lastFragPlayingIdx = undefined;
    levels = null;
    events = { url : url, date : jsLoadDate, load : [], buffer : [], video : []};
    api.load(url);
    appendLog("load URL " + url);
    $('#currentPosition').html(0);
    $('#currentDuration').html(0);
    $('#bufferLength').html(0);
    $('#backBufferLength').html(0);
    $('#sliding').html(0);
    $('#watched').html(0);
}

function toggleDebugLogs() {
    var state = api.getLogDebug();
    state = !state;
    api.playerSetLogDebug(state);
    $('#debugLogState').html(state.toString());
}

function toggleDebug2Logs() {
    var state = api.getLogDebug2();
    state = !state;
    $('#debug2LogState').html(state.toString());
    api.playerSetLogDebug2(state);
}

function toggleUseHardwareVideoDecoder() {
    var state = api.getUseHardwareVideoDecoder();
    state = !state;
    $('#hwVideoDecoderState').html(state.toString());
    api.playerSetUseHardwareVideoDecoder(state);
}

function toggleFlushLiveURLCache() {
    var state = api.getflushLiveURLCache();
    state = !state;
    $('#flushLiveURLState').html(state.toString());
    api.playerSetflushLiveURLCache(state);
}

function toggleJSURLStream() {
    var state = api.getJSURLStream();
    state = !state;
    $('#JSURLStreamState').html(state.toString());
    api.playerSetJSURLStream(state);
}

function toggleCapLeveltoStage() {
    var state = api.getCapLeveltoStage();
    state = !state;
    $('#capLeveltoStageState').html(state.toString());
    api.playerCapLeveltoStage(state);
}

// Create a single global callback function and pass it's name
// to the SWF with the name `callback` in the FlashVars parameter.
window.flashlsCallback = function(eventName, args) {
    flashlsEvents[eventName].apply(null, args);
}

var flashlsEvents = {
    ready: function(flashTime) {
        api = new flashlsAPI(getFlashMovieObject("moviename"));
    },
    videoSize: function(width, height) {
        var event = {time : new Date() - jsLoadDate, type : "resize", name : width + 'x' + height};
        events.video.push(event);
        $("#currentResolution").html("video resolution:" + width + 'x' + height);
        var ratio = width / height;
        if (width > $('#video').innerWidth()-30) {
            width = $('#video').innerWidth()-30;
            height = Math.round(width / ratio);
        }
        api.flashObject.width = width;
        api.flashObject.height = height;
        var canvas = $('#buffered_c')[0];
        canvas.width = width;
    },
    complete: function() {
        appendLog("onComplete(), playback completed");
    },
    manifest: function(duration, levels_, loadmetrics) {
        api.play(-1);
        api.volume(10);
    }
}


function sortObject(obj) {
    if(typeof obj !== 'object')
        return obj
    var temp = {};
    var keys = [];
    for(var key in obj)
        keys.push(key);
    keys.sort();
    for(var index in keys)
        temp[keys[index]] = sortObject(obj[keys[index]]);
    return temp;
}

function showCanvas()  {
    showMetrics();
    document.getElementById('buffered_c').style.display="block";
}

function hideCanvas()  {
    hideMetrics();
    document.getElementById('buffered_c').style.display="none";
}

function getMetrics() {
    var json = JSON.stringify(events);
    var jsonpacked = jsonpack.pack(json);
    console.log("packing JSON from " + json.length + " to " + jsonpacked.length + " bytes");
    return btoa(jsonpacked);
}

function copyMetricsToClipBoard() {
    copyTextToClipboard(getMetrics());
}

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
}


function goToMetrics() {
    var url = document.URL;
    url = url.substr(0,url.lastIndexOf("/")+1) + 'metrics.html';
    console.log(url);
    window.open(url,'_blank');
}

function goToMetricsPermaLink() {
    var url = document.URL;
    var b64 = getMetrics();
    url = url.substr(0,url.lastIndexOf("/")+1) + 'metrics.html?data=' + b64;
    console.log(url);
    window.open(url,'_blank');
}

function buffered_seek(event) {
    var canvas = document.getElementById('buffered_c');
    var position = (event.clientX - canvas.offsetLeft) / canvas.width * api.getDuration();
    api.seek(position);
}

function updateBufferCanvas(position,duration,buffer, backbuffer) {
    var canvas = document.getElementById('buffered_c');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "gray";
    var start = (position-backbuffer)/duration * canvas.width;
    var end = (position+buffer)/duration * canvas.width;
    ctx.fillRect(start, 3, Math.max(2, end-start), 10);
    ctx.fillStyle = "blue";
    var x = position / duration * canvas.width;
    ctx.fillRect(x, 0, 2, 15);
}

function updateLevelInfo() {
    var button_template = '<button type="button" class="btn btn-sm ';
    var button_enabled  = 'btn-primary" ';
    var button_disabled = 'btn-success" ';

    var autoLevel = api.getAutoLevel();
    var autoLevelCapping = api.getAutoLevelCapping();
    var currentLevel = api.getCurrentLevel();
    var nextLevel = api.getNextLevel();
    var loadLevel = api.getLoadLevel();

    var html1 = button_template;
    if(autoLevel) {
        html1 += button_enabled;
    } else {
        html1 += button_disabled;
    }
    html1 += 'onclick="api.setCurrentLevel(-1);updateLevelInfo()">auto</button>';


    var html2 = button_template;
    if(autoLevel) {
        html2 += button_enabled;
    } else {
        html2 += button_disabled;
    }
    html2 += 'onclick="api.setLoadLevel(-1);updateLevelInfo()">auto</button>';

    var html3 = button_template;
    if(autoLevelCapping === -1) {
        html3 += button_enabled;
    } else {
        html3 += button_disabled;
    }
    html3 += 'onclick="api.playerSetAutoLevelCapping(-1);updateLevelInfo()">none</button>';

    var html4 = button_template;
    if(autoLevel) {
        html4 += button_enabled;
    } else {
        html4 += button_disabled;
    }
    html4 += 'onclick="api.setNextLevel(-1);updateLevelInfo()">auto</button>';

    for (var i=0; i < levels.length; i++) {
        html1 += button_template;
        if(currentLevel === i) {
            html1 += button_enabled;
        } else {
            html1 += button_disabled;
        }
        var levelName = i, label = level2label(i);
        if(label) {
            levelName += '(' + level2label(i) + ')';
        }
        html1 += 'onclick="api.setCurrentLevel(' + i + ');updateLevelInfo()">' + levelName + '</button>';


        html2 += button_template;
        if(loadLevel === i) {
            html2 += button_enabled;
        } else {
            html2 += button_disabled;
        }
        html2 += 'onclick="api.setLoadLevel(' + i + ');updateLevelInfo()">' + levelName + '</button>';

        html3 += button_template;
        if(autoLevelCapping === i) {
            html3 += button_enabled;
        } else {
            html3 += button_disabled;
        }
        html3 += 'onclick="api.playerSetAutoLevelCapping(' + i + ');updateLevelInfo()">' + levelName + '</button>';

        html4 += button_template;
        if(nextLevel === i) {
            html4 += button_enabled;
        } else {
            html4 += button_disabled;
        }
        html4 += 'onclick="api.setNextLevel(' + i + ');updateLevelInfo()">' + levelName + '</button>';
    }
    $("#currentLevelControl").html(html1);
    $("#loadLevelControl").html(html2);
    $("#levelCappingControl").html(html3);
    $("#nextLevelControl").html(html4);
}

function level2label(index) {
    if(levels && levels.length-1 >= index) {
        var level = levels[index];
        if (level.name) {
            return level.name;
        } else {
            if (level.height) {
                return(level.height + 'p / ' + Math.round(level.bitrate / 1024) + 'kb');
            } else {
                if(level.bitrate) {
                    return(Math.round(level.bitrate / 1024) + 'kb');
                } else {
                    return null;
                }
            }
        }
    }
}

