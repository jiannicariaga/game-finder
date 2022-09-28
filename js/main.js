var url = 'https://api.rawg.io/api/games?key=76e41dc99b8042e0b6f0cd116d9dadc1&page=1';
var newUrl = null;
var $cardView = document.querySelector('.card-view');
var $backButton = document.querySelector('.back-button');
var $nextButton = document.querySelector('.next-button');
var $pageNumberTop = document.querySelector('.page-number-top');
var $pageNumberBot = document.querySelector('.page-number-bot');
var pageNumber = 1;

function getData(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url.slice(0, -1) + pageNumber.toString());
  xhr.responseType = 'json';

  xhr.addEventListener('load', function (event) {
    renderCards(xhr.response.results);
    newUrl = xhr.response.next;
  });

  xhr.send();
}

function renderCards(array) {
  $cardView.replaceChildren();

  for (var i = 0; i < array.length; i++) {
    var cardWrapper = document.createElement('div');
    cardWrapper.className = 'card-wrapper col-50';
    $cardView.appendChild(cardWrapper);

    var card = document.createElement('div');
    card.className = 'card row';
    cardWrapper.appendChild(card);

    var column1 = document.createElement('div');
    column1.className = 'col-100';
    card.appendChild(column1);

    var row1 = document.createElement('div');
    row1.className = 'row';
    column1.appendChild(row1);

    var thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail col-100';
    row1.appendChild(thumbnail);

    var img = document.createElement('img');
    img.src = array[i].background_image;
    img.alt = array[i].name;
    thumbnail.appendChild(img);

    var row2 = document.createElement('div');
    row2.className = 'row';
    column1.appendChild(row2);

    var title = document.createElement('div');
    title.className = 'title col-100';
    row2.appendChild(title);

    var h4 = document.createElement('h4');
    h4.className = 'text-center';
    h4.textContent = array[i].name;
    title.appendChild(h4);
  }
}

$backButton.addEventListener('click', function (event) {
  pageNumber--;
  $pageNumberTop.textContent = pageNumber;
  $pageNumberBot.textContent = pageNumber;
  $nextButton.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pageNumber === 1) {
    $backButton.hidden = true;
  }

  getData(newUrl);
});

$nextButton.addEventListener('click', function (event) {
  pageNumber++;
  $pageNumberTop.textContent = pageNumber;
  $pageNumberBot.textContent = pageNumber;
  $backButton.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (newUrl === null) {
    $nextButton.hidden = true;
  }

  getData(newUrl);
});

getData(url);
