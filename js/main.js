var domain = 'https://api.rawg.io/api/games';
var key = '?key=76e41dc99b8042e0b6f0cd116d9dadc1';
var pageParam = '&page=';
var searchParam = '&search=';
var view = 'featured';
var pageNumber = 1;
var previousUrl = null;
var nextUrl = null;
var previousView = null;
var timeoutId = null;

var $viewLabel = document.querySelector('.view-label');
var $featuredView = document.querySelector('[data-view="featured"]');
var $detailView = document.querySelector('[data-view="detail"]');
var $searchView = document.querySelector('[data-view="search"]');
var $searchResultsView = document.querySelector('[data-view="search-results"]');
var $bookmarkIconHeader = document.querySelector('.bookmark-icon-header');
var $searchIcon = document.querySelector('.search-icon');
var $cards = document.querySelector('.cards');
var $backButton = document.querySelector('.back-button');
var $nextButton = document.querySelector('.next-button');
var $pageLabel = document.querySelector('.page-label');
var $pageNumberTop = document.querySelector('.page-number-top');
var $pageNumberBot = document.querySelector('.page-number-bot');
var $backLinkDetail = document.querySelector('.back-link-detail');
var $backLinkResults = document.querySelector('.back-link-results');
var $backLinkToFeatured = document.querySelector('.back-to-featured');
var $topLink = document.querySelector('.top-link');
var $form = document.querySelector('form');
var $searchInput = document.querySelector('input');
var $resultsList = document.querySelector('.results-list');
var $closeButton = document.querySelector('.close-button');

function getData(url) {
  var xhr = new XMLHttpRequest();

  if (view === 'featured' && previousView !== 'search') {
    xhr.open('GET', domain + key + pageParam + pageNumber.toString());
  } else {
    xhr.open('GET', url);
  }

  xhr.responseType = 'json';

  xhr.addEventListener('load', function (event) {
    if (view === 'featured') {
      renderCards(xhr.response.results);
      previousUrl = xhr.response.previous;
      nextUrl = xhr.response.next;
    } else if (view === 'detail') {
      fillDetail(xhr.response);
    } else if (view === 'search') {
      renderResults(xhr.response.results);
      $searchResultsView.hidden = false;
      timeoutId = null;
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
      if (attributes[key] === null) {
        $element.setAttribute(key, 'https://via.placeholder.com/200x200.jpg?text=+');
      } else {
        $element.setAttribute(key, attributes[key]);
      }
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
      generateDomTree('div', { class: 'card-wrapper col-50' }, [
        generateDomTree('div', {
          class: 'card-featured row',
          'data-url': domain + '/' + array[i].slug + key
        }, [
          generateDomTree('div', { class: 'col-100' }, [
            generateDomTree('div', { class: 'row' }, [
              generateDomTree('div', { class: 'card-thumbnail-featured col-100' }, [
                generateDomTree('img', {
                  src: array[i].background_image,
                  alt: array[i].name
                })])]),
            generateDomTree('div', { class: 'row' }, [
              generateDomTree('div', { class: 'card-title-featured col-100' }, [
                generateDomTree('h4', {
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

  if (object.esrb_rating !== null) {
    $esrbRating.textContent = object.esrb_rating.name;
  } else {
    $esrbRating.textContent = '';
  }

  $website.href = object.website;
}

function addListElements(parentElement, array) {
  for (var i = 0; i < array.length; i++) {
    var child = document.createElement('li');
    child.textContent = array[i].name;
    parentElement.appendChild(child);
  }
}

function toggleModal(event) {
  if (view !== 'search') {
    $searchView.hidden = false;
    previousView = view;
    view = 'search';
  } else {
    $searchView.hidden = true;
    view = previousView;
  }

  $searchInput.value = null;
  $resultsList.replaceChildren();
  $searchResultsView.hidden = true;
}

function renderResults(array) {
  $resultsList.replaceChildren();

  for (var i = 0; i < array.length; i++) {
    if (i === 10) {
      return;
    }

    $resultsList.appendChild(
      generateDomTree('li', {},
        [generateDomTree('a', {
          href: '#',
          'data-url': domain + '/' + array[i].slug + key,
          textContent: array[i].name
        })]));
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

$backButton.addEventListener('click', function (event) {
  pageNumber--;
  $pageNumberTop.textContent = pageNumber;
  $pageNumberBot.textContent = pageNumber;
  $nextButton.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  getData(previousUrl);

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
  getData(nextUrl);

  if (nextUrl === null) {
    $nextButton.hidden = true;
  }
});

function toFeatured(event) {
  view = 'featured';
  $featuredView.hidden = false;
  $detailView.hidden = true;
}

$backLinkDetail.addEventListener('click', toFeatured);
$backLinkResults.addEventListener('click', toFeatured);

$topLink.addEventListener('click', function (event) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

$searchIcon.addEventListener('click', toggleModal);
$closeButton.addEventListener('click', toggleModal);

$searchInput.addEventListener('keyup', function (event) {
  var searchUrl = domain + key + searchParam + $searchInput.value;

  if (event && timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () { getData(searchUrl); }, 500);
  } else {
    timeoutId = setTimeout(function () { getData(searchUrl); }, 500);
  }
});

$resultsList.addEventListener('click', function (event) {
  if (event.target.matches('a')) {
    view = 'detail';
    $featuredView.hidden = true;
    $detailView.hidden = false;
    $searchView.hidden = true;
    getData(event.target.getAttribute('data-url'));
  }
});

$form.addEventListener('submit', function (event) {
  event.preventDefault();
  var searchUrl = domain + key + searchParam + $searchInput.value;
  previousView = view;
  view = 'featured';
  $viewLabel.textContent = 'Search Results';
  $backLinkToFeatured.hidden = false;
  $featuredView.hidden = false;
  $detailView.hidden = true;
  $searchView.hidden = true;
  getData(searchUrl);
});

$backLinkToFeatured.addEventListener('click', function (event) {
  $viewLabel.textContent = 'Featured';
  $backLinkToFeatured.hidden = true;
  $pageLabel.hidden = false;
  $pageNumberTop.hidden = false;
  $backButton.hidden = true;
  $pageNumberBot.hidden = false;
  $nextButton.hidden = false;
  $cards.replaceChildren();
  getData(domain + key + pageParam + pageNumber.toString());
});

$bookmarkIconHeader.addEventListener('click', function (event) {
  view = 'featured';
  $viewLabel.textContent = 'Bookmarks';
  $backLinkToFeatured.hidden = false;
  $featuredView.hidden = false;
  $detailView.hidden = true;
  $pageLabel.hidden = true;
  $pageNumberTop.hidden = true;
  $backButton.hidden = true;
  $pageNumberBot.hidden = true;
  $nextButton.hidden = true;
  $cards.replaceChildren();
});

getData();
