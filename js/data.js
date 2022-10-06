/* exported data */

var data = {
  bookmarks: [],
  currentDetail: {
    background_image: null,
    name: null,
    slug: null
  }
};
var previousGameDataJSON = localStorage.getItem('game-data');

if (previousGameDataJSON !== null) {
  data = JSON.parse(previousGameDataJSON);
}

window.addEventListener('beforeunload', function (event) {
  var dataJSON = JSON.stringify(data);
  localStorage.setItem('game-data', dataJSON);
});
