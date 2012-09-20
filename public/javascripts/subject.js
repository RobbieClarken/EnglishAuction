var socket = io.connect('http://localhost/subjects');

function enableButton(name) {
  $('#'+name).removeAttr('disabled');
}
