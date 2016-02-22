window.onload = function(){

renderName();
call_zoom_api("_reg")
}

window.onkeyup = function(event) {
  if (event.keyCode == 32) { switchbar();};
  if (event.keyCode == 38) { channNext();};
  if (event.keyCode == 40) { channPrev();};
  
}

var site = "78.139.215.205"
var canname = "server not respond";
var showbar = 0;
var number = "26374"

function channNext() {
  call_zoom_api("_next");
}

function channPrev() {
  call_zoom_api("_prev");
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

function my_callback(hash)
{
// hash - будет содержать ответ
}

function call_zoom_api(func_name)
{
var src = 'http://' + site + '/api/' + func_name + '?' + 'number='+ number + '&' + Math.random();
var xhr = new XMLHttpRequest();
xhr.open('GET', src, true);
xhr.send();

xhr.onreadystatechange = function() { // (3)
    if (xhr.readyState != 4) return;

    // button.innerHTML = 'Готово!';

    if (xhr.status != 200) {
      alert(xhr.status + ': ' + xhr.statusText);
    } else {
      alert(xhr.responseText);
    }

  }

}
// call_zoom_api("_reg");
// call_zoom_api("_play");
// call_zoom_api("_next");
// call_zoom_api("_prev");