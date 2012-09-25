var socket = io.connect('/subjects');

function enableButton(name) {
  $('#'+name).removeAttr('disabled');
}
