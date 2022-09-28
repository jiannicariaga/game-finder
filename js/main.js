var domain = 'https://api.rawg.io/api/games';
var key = '?key=76e41dc99b8042e0b6f0cd116d9dadc1';
var pageParam = '&page=';
var pageUrl = null;
var gameUrl = null;
var $backLink = document.querySelector('a');
var $featuredView = document.querySelector('[data-view="featured"]');
var $detailView = document.querySelector('[data-view="detail"]');
var $cards = document.querySelector('.cards');
var $backButton = document.querySelector('.back-button');
var $nextButton = document.querySelector('.next-button');
var $pageNumberTop = document.querySelector('.page-number-top');
var $pageNumberBot = document.querySelector('.page-number-bot');
var pageNumber = 1;
data.view = 'featured'; // Temp

function getData(url) {
  var xhr = new XMLHttpRequest();

  if (data.view === 'featured') {
    xhr.open('GET', domain + key + pageParam + pageNumber.toString());
  } else if (data.view === 'detail') {
    xhr.open('GET', url);
  }

  xhr.responseType = 'json';

  xhr.addEventListener('load', function (event) {
    if (data.view === 'featured') {
      renderCards(xhr.response.results);
      pageUrl = xhr.response.next;
    } else if (data.view === 'detail') {
      // fillDetail(xhr.response);
    }
  });

  xhr.send();
}

function renderCards(array) {
  $cards.replaceChildren();

  for (var i = 0; i < array.length; i++) {
    var cardWrapper = document.createElement('div');
    cardWrapper.className = 'card-wrapper col-50';
    $cards.appendChild(cardWrapper);

    var card = document.createElement('div');
    card.className = 'card-featured row';
    card.setAttribute('data-url', domain + '/' + array[i].slug + key);
    cardWrapper.appendChild(card);

    var column1 = document.createElement('div');
    column1.className = 'col-100';
    card.appendChild(column1);

    var row1 = document.createElement('div');
    row1.className = 'row';
    column1.appendChild(row1);

    var thumbnail = document.createElement('div');
    thumbnail.className = 'card-thumbnail-featured col-100';
    row1.appendChild(thumbnail);

    var img = document.createElement('img');
    img.src = array[i].background_image;
    img.alt = array[i].name;
    thumbnail.appendChild(img);

    var row2 = document.createElement('div');
    row2.className = 'row';
    column1.appendChild(row2);

    var title = document.createElement('div');
    title.className = 'card-title-featured col-100';
    row2.appendChild(title);

    var h4 = document.createElement('h4');
    h4.className = 'text-center';
    h4.textContent = array[i].name;
    title.appendChild(h4);
  }
}

// function fillDetail(object) {

// }

$cards.addEventListener('click', function (event) {
  if (event.target.closest('.card-featured')) {
    gameUrl = event.target.closest('.card-featured').getAttribute('data-url');
    data.view = 'detail';
    $featuredView.hidden = true;
    $detailView.hidden = false;

    getData(gameUrl);
  }
});

$backLink.addEventListener('click', function (event) {
  data.view = 'featured';
  $featuredView.hidden = false;
  $detailView.hidden = true;
});

$backButton.addEventListener('click', function (event) {
  pageNumber--;
  $pageNumberTop.textContent = pageNumber;
  $pageNumberBot.textContent = pageNumber;
  $nextButton.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pageNumber === 1) {
    $backButton.hidden = true;
  }

  getData(pageUrl);
});

$nextButton.addEventListener('click', function (event) {
  pageNumber++;
  $pageNumberTop.textContent = pageNumber;
  $pageNumberBot.textContent = pageNumber;
  $backButton.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pageUrl === null) {
    $nextButton.hidden = true;
  }

  getData(pageUrl);
});

getData(domain);
