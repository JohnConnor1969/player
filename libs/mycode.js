window.onload = function(){

  regPlayer();
  call_zoom_api("_play");
  setTimeout('channPlay()', 4000);
}

window.onkeyup = function(event) {
  switch (event.keyCode){
    case 32:
      switchbar()
      break
    case 38:
      channNext()
      break
    case 40:
      channPrev()
      break
  }
}

var site = "78.139.215.205"
var canname = "";
var showbar = 0;
var number;
var respondServers;
var link;

function getRandomInt(min, max) {
  return Math.floor(Math.random()*(max - min + 1)) + min;
}

function regPlayer() {
  if (!resumePlayer()){
    number = getRandomInt(100000,990000);
    call_zoom_api("_reg");
    if (respondServers.number == number) {
      savePlayer();
    }
    else {
      regPlayer();
    }
  }
}

function channPlay(){
  canname = respondServers.name;
  link = respondServers.link;
  renderName();
  loadStream(link);
}

function channNext() {
  call_zoom_api("_next");
  canname = respondServers.name;
  link = respondServers.link;
  renderName();
  loadStream(link);
}

function channPrev() {
  call_zoom_api("_prev");
  canname = respondServers.name;
  link = respondServers.link;
  renderName();
  loadStream(link);
}

function switchbar() {
  if (showbar == 0) {
    $("#header").toggle();
    showbar = 1;
  }

  else {
    $("#header").hide();
    showbar = 0
  }
  
}

function renderName() {

  var myChannel = document.getElementById('logo');
  myChannel.innerHTML = canname;
}

function renderTime() {


  var timenow = new Date();
  var h = timenow.getHours();
  var m = timenow.getMinutes();

  var myTime = document.getElementById('time');
  if (m < 10) {
  m = "0" + m
  };
  myTime.innerHTML = h + ":" + m 
  setTimeout('renderTime()', 15000);
}
renderTime();



function call_zoom_api(func_name){
  var src = 'http://' + site + '/api/' + func_name + '?' + 'number='+ number + '&' + Math.random();
  var xhr = new XMLHttpRequest();
  xhr.open('GET', src, false);
  xhr.send();

  // xhr.onreadystatechange = function() { // (3)
    // if (xhr.readyState != 4) return;

    // button.innerHTML = 'Готово!';

    // if (xhr.status != 200) {
      // alert(xhr.status + ': ' + xhr.statusText);
    // } else {
      respondServers = JSON.parse(xhr.responseText);
      // alert(xhr.responseText);
    // }

  // }

}
// call_zoom_api("_reg");
// call_zoom_api("_play");
// call_zoom_api("_next");
// call_zoom_api("_prev");
function resumePlayer() {
    if (!supportsLocalStorage()) { return false; }
    // number = (localStorage["player.number"] == "true");
    if (!(localStorage["player.number"])) { return false; }
    number = (localStorage["player.number"]);
    return true;
}

function savePlayer() {
    if (!supportsLocalStorage()) { return false; }
    localStorage["player.number"] = number;
 
    return true;
}

function supportsLocalStorage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
} catch (e) {
    return false;
  }
}