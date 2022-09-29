var domain = 'https://api.rawg.io/api/games';
var key = '?key=76e41dc99b8042e0b6f0cd116d9dadc1';
var pageParam = '&page=';
// var searchParam = '&search=';
var pageUrl = null;
var $featuredView = document.querySelector('[data-view="featured"]');
var $detailView = document.querySelector('[data-view="detail"]');
var $searchView = document.querySelector('[data-view="search"]');
var $cards = document.querySelector('.cards');
var $searchIcon = document.querySelector('.search-icon');
var $backLink = document.querySelector('.back-link');
var $topLink = document.querySelector('.top-link');
var $backButton = document.querySelector('.back-button');
var $nextButton = document.querySelector('.next-button');
var $closeButton = document.querySelector('.close-button');
var $pageNumberTop = document.querySelector('.page-number-top');
var $pageNumberBot = document.querySelector('.page-number-bot');
var $searchInput = document.querySelector('input');
var previousView = null;
var view = 'featured';
var pageNumber = 1;
// var timerId = null;

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

function generateDomTree(tagName, attributes, children) {
  var $element = document.createElement(tagName);

  if (!children) {
    children = [];
  }

  for (var key in attributes) {
    if (key === 'textContent') {
      $element.textContent = attributes.textContent;
    } else {
      $element.setAttribute(key, attributes[key]);
    }
  }

  for (var i = 0; i < children.length; i++) {
    $element.append(children[i]);
  }

  return $element;
}

function renderCards(array) {
  $cards.replaceChildren();

  for (var i = 0; i < array.length; i++) {
    $cards.appendChild(
      generateDomTree('div', { class: 'card-wrapper col-50' },
        [generateDomTree('div', {
          class: 'card-featured row',
          'data-url': domain + '/' + array[i].slug + key
        },
        [generateDomTree('div', { class: 'col-100' },
          [generateDomTree('div', { class: 'row' },
            [generateDomTree('div', { class: 'card-thumbnail-featured col-100' },
              [generateDomTree('img', {
                src: array[i].background_image,
                alt: array[i].name
              })])]),
          generateDomTree('div', { class: 'row' },
            [generateDomTree('div', { class: 'card-title-featured col-100' },
              [generateDomTree('h4', {
                class: 'text-center',
                textContent: array[i].name
              })])])])])]));
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

  $title.textContent = object.name;
  $thumbnail.src = object.background_image;
  $thumbnail.alt = object.name;
  $about.textContent = object.description_raw;
  $genre.replaceChildren();
  addListElements($genre, object.genres);
  $releaseDate.textContent = object.released;
  $developer.replaceChildren();
  addListElements($developer, object.developers);
  $publisher.replaceChildren();
  addListElements($publisher, object.publishers);
  $esrbRating.textContent = object.esrb_rating.name;
  $website.href = object.website;
}

function addListElements(parentElement, array) {
  for (var i = 0; i < array.length; i++) {
    var child = document.createElement('li');
    child.textContent = array[i].name;
    parentElement.appendChild(child);
  }
}

$cards.addEventListener('click', function (event) {
  if (event.target.closest('.card-featured')) {
    view = 'detail';
    $featuredView.hidden = true;
    $detailView.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getData(event.target.closest('.card-featured').getAttribute('data-url'));
  }
});

$backLink.addEventListener('click', function (event) {
  view = 'featured';
  $featuredView.hidden = false;
  $detailView.hidden = true;
});

$topLink.addEventListener('click', function (event) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

$backButton.addEventListener('click', function (event) {
  pageNumber--;
  $pageNumberTop.textContent = pageNumber;
  $pageNumberBot.textContent = pageNumber;
  $nextButton.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  getData(pageUrl);

  if (pageNumber === 1) {
    $backButton.hidden = true;
  }
});

$nextButton.addEventListener('click', function (event) {
  pageNumber++;
  $pageNumberTop.textContent = pageNumber;
  $pageNumberBot.textContent = pageNumber;
  $backButton.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  getData(pageUrl);

  if (pageUrl === null) {
    $nextButton.hidden = true;
  }
});

function toggleModal(event) {
  if (view !== 'search') {
    $searchView.hidden = false;
    previousView = view;
    view = 'search';
  } else {
    $searchView.hidden = true;
    view = previousView;
  }
}

$searchIcon.addEventListener('click', toggleModal);
$closeButton.addEventListener('click', toggleModal);

$searchInput.addEventListener('keyup', function (event) {
  // var input = $searchInput.value;
  // console.log(input);

  // var searchUrl = domain + key + searchParam + $searchInput.value;

});

getData();
