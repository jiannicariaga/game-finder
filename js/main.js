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
var view = 'featured';
var pageNumber = 1;

function getData(url) {
  var xhr = new XMLHttpRequest();

  if (view === 'featured') {
    xhr.open('GET', domain + key + pageParam + pageNumber.toString());
  } else if (view === 'detail') {
    xhr.open('GET', url);
  }

  xhr.responseType = 'json';

  xhr.addEventListener('load', function (event) {
    if (view === 'featured') {
      renderCards(xhr.response.results);
      pageUrl = xhr.response.next;
    } else if (view === 'detail') {
      fillDetail(xhr.response);
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

function fillDetail(object) {
  var $title = document.querySelector('.title');
  var $thumbnail = document.querySelector('.thumbnail-detail');
  var $about = document.querySelector('.about');
  var $genre = document.querySelector('.genre');
  var $releaseDate = document.querySelector('.release-date');
  var $developer = document.querySelector('.developer');
  var $publisher = document.querySelector('.publisher');
  var $esrbRating = document.querySelector('.esrb-rating');
  var $website = document.querySelector('.website');

  $genre.replaceChildren();
  $developer.replaceChildren();
  $publisher.replaceChildren();

  $title.textContent = object.name;
  $thumbnail.src = object.background_image;
  $thumbnail.alt = object.name;
  $about.textContent = object.description_raw;

  for (var i = 0; i < object.genres.length; i++) {
    var el1 = document.createElement('li');
    el1.textContent = object.genres[i].name;
    $genre.appendChild(el1);
  }

  $releaseDate.textContent = object.released;

  for (var j = 0; j < object.developers.length; j++) {
    var el2 = document.createElement('li');
    el2.textContent = object.developers[j].name;
    $developer.appendChild(el2);
  }

  for (var k = 0; k < object.publishers.length; k++) {
    var el3 = document.createElement('li');
    el3.textContent = object.publishers[k].name;
    $publisher.appendChild(el3);
  }

  $esrbRating.textContent = object.esrb_rating.name;
  $website.href = object.website;
}

$cards.addEventListener('click', function (event) {
  if (event.target.closest('.card-featured')) {
    gameUrl = event.target.closest('.card-featured').getAttribute('data-url');
    view = 'detail';
    $featuredView.hidden = true;
    $detailView.hidden = false;

    getData(gameUrl);
  }
});

$backLink.addEventListener('click', function (event) {
  view = 'featured';
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
