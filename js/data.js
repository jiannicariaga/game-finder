/* exported data */

var data = {
  view: 'featured',
  pageContent: [],
  currentPage: 1
};
var previousGameDataJSON = localStorage.getItem('game-data');

if (previousGameDataJSON !== null) {
  data = JSON.parse(previousGameDataJSON);
}

window.addEventListener('beforeunload', function (event) {
  var dataJSON = JSON.stringify(data);

  localStorage.setItem('game-data', dataJSON);
});
