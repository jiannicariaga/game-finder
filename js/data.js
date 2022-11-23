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
if (previousGameDataJSON !== null) data = JSON.parse(previousGameDataJSON);
window.addEventListener('beforeunload', function (event) {
  localStorage.setItem('game-data', JSON.stringify(data));
});
window.addEventListener('pagehide', function (event) {
  localStorage.setItem('game-data', JSON.stringify(data));
});
