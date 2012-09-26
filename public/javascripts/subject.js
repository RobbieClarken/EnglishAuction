var socket = io.connect('/sio/subjects');

function enableButton(name) {
  $('#'+name).removeAttr('disabled');
}
