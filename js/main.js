var domain = 'https://api.rawg.io/api/games';
var key = '?key=76e41dc99b8042e0b6f0cd116d9dadc1';
var pageParam = '&page=';
var searchParam = '&search=';
var view = 'featured';
var previousView = null;
var previousPageUrl = null;
var nextPageUrl = null;
var pageNumberFeat = 1;
var pageNumberResults = 1;
var timeoutId = null;

var placeholderImage = 'https://via.placeholder.com/200x200.jpg?text=+';

var $bookmarkIconHeader = document.querySelector('.bookmarks');
var $searchIcon = document.querySelector('.search');
var $featuredView = document.querySelector('[data-view="featured"]');
var $backLinkView = document.querySelector('[data-view="back-link"]');
var $backLinkFeat = document.querySelector('.back-arrow-feat');
var $viewLabel = document.querySelector('.view-label');
var $pageLabel = document.querySelector('.page-label');
var $pageNumTop = document.querySelector('.page-number-top');
var $featuredGames = document.querySelector('.featured-games');
var $backButton = document.querySelector('.back-button');
var $pageNumBot = document.querySelector('.page-number-bot');
var $nextButton = document.querySelector('.next-button');
var $detailView = document.querySelector('[data-view="detail"]');
var $backLinkDetail = document.querySelector('.back-arrow-detail');
var $bookmarkAction = document.querySelector('.bookmark-action');
var $topLinkDetail = document.querySelector('.up-arrow');
var $searchView = document.querySelector('[data-view="search"]');
var $form = document.querySelector('form');
var $input = document.querySelector('input');
var $suggestionsView = document.querySelector('[data-view="suggestions"]');
var $suggestions = document.querySelector('.suggestions');
var $exitButton = document.querySelector('.exit-button');

function getData(url, task) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function (event) { task(xhr.response); });
  xhr.send();
}

function createDomTree(tagName, attributes, children) {
  var $element = document.createElement(tagName);

  if (!children) {
    children = [];
  }

  for (var key in attributes) {
    if (key === 'textContent') {
      $element.textContent = attributes.textContent;
    } else {
      if (attributes[key] === null) {
        $element.setAttribute(key, placeholderImage);
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

// FEATURED VIEW
function renderCards(object) {
  $featuredGames.replaceChildren();
  previousPageUrl = object.previous;
  nextPageUrl = object.next;

  for (var i = 0; i < object.results.length; i++) {
    $featuredGames.appendChild(
      createDomTree('div', { class: 'card-wrapper col-50' }, [
        createDomTree('div', {
          class: 'card-featured row',
          'data-url': domain + '/' + object.results[i].slug + key
        }, [
          createDomTree('div', { class: 'col-100' }, [
            createDomTree('div', { class: 'row' }, [
              createDomTree('div', { class: 'card-thumbnail-featured col-100' }, [
                createDomTree('img', {
                  src: object.results[i].background_image,
                  alt: object.results[i].name
                })])]),
            createDomTree('div', { class: 'row' }, [
              createDomTree('div', { class: 'card-title-featured col-100' }, [
                createDomTree('h4', {
                  class: 'text-center',
                  textContent: object.results[i].name
                })])])])])]));
  }
}

$backButton.addEventListener('click', function (event) {
  getData(previousPageUrl, renderCards);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $nextButton.hidden = false;

  if (view === 'featured') {
    pageNumberFeat--;
    $pageNumTop.textContent = pageNumberFeat;
    $pageNumBot.textContent = pageNumberFeat;
  } else if (view === 'results') {
    pageNumberResults--;
    $pageNumTop.textContent = pageNumberResults;
    $pageNumBot.textContent = pageNumberResults;
  }

  if (pageNumberFeat === 1 || pageNumberResults === 1) {
    $backButton.hidden = true;
  }
});

$nextButton.addEventListener('click', function (event) {
  getData(nextPageUrl, renderCards);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $backButton.hidden = false;

  if (view === 'featured') {
    pageNumberFeat++;
    $pageNumTop.textContent = pageNumberFeat;
    $pageNumBot.textContent = pageNumberFeat;
  } else if (view === 'results') {
    pageNumberResults++;
    $pageNumTop.textContent = pageNumberResults;
    $pageNumBot.textContent = pageNumberResults;
  }

  if (nextPageUrl === null) {
    $nextButton.hidden = true;
  }
});

// DETAIL VIEW
function renderDetailList(parentElement, array) {
  parentElement.replaceChildren();

  for (var i = 0; i < array.length; i++) {
    parentElement.appendChild(
      createDomTree('li', { textContent: array[i].name })
    );
  }
}

function fillDetail(object) {
  var $title = document.querySelector('.title');
  var $banner = document.querySelector('.banner');
  var $about = document.querySelector('.about');
  var $genre = document.querySelector('.genre');
  var $releaseDate = document.querySelector('.release-date');
  var $developer = document.querySelector('.developer');
  var $publisher = document.querySelector('.publisher');
  var $esrbRating = document.querySelector('.esrb-rating');
  var $website = document.querySelector('.website');
  $title.textContent = object.name;
  $banner.src = object.background_image;
  $banner.alt = object.name;
  $about.textContent = object.description_raw;
  $releaseDate.textContent = object.released;
  $website.href = object.website;
  renderDetailList($genre, object.genres);
  renderDetailList($developer, object.developers);
  renderDetailList($publisher, object.publishers);

  data.currentDetail = {
    background_image: object.background_image,
    name: object.name,
    slug: object.slug
  };

  if (object.esrb_rating !== null) {
    $esrbRating.textContent = object.esrb_rating.name;
  } else {
    $esrbRating.textContent = '';
  }

  var index = data.bookmarks.findIndex(function (object) {
    return object.slug === data.currentDetail.slug;
  });

  if (index === -1) {
    $bookmarkAction.className = 'bookmark-action far fa-bookmark';
  } else {
    $bookmarkAction.className = 'bookmark-action fas fa-bookmark';
  }
}

$featuredGames.addEventListener('click', function (event) {
  if (event.target.closest('.card-featured')) {
    $bookmarkAction.className = 'bookmark-action far fa-bookmark';
    getData(event.target.closest('.card-featured').getAttribute('data-url'), fillDetail);
    window.scrollTo({ top: 0, behavior: 'instant' });
    $featuredView.hidden = true;
    $detailView.hidden = false;
    view = 'detail';
  }
});

// SEARCH VIEW
function renderSuggestions(object) {
  $suggestions.replaceChildren();

  for (var i = 0; i < object.results.length; i++) {
    if (i === 10) {
      return;
    }

    $suggestions.appendChild(
      createDomTree('li', {}, [
        createDomTree('a', {
          href: '#',
          'data-url': domain + '/' + object.results[i].slug + key,
          textContent: object.results[i].name
        })]));
  }
}

$input.addEventListener('keyup', function (event) {
  if (event && timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      getData(domain + key + searchParam + $input.value, renderSuggestions);
    }, 500);
  } else {
    timeoutId = setTimeout(function () {
      getData(domain + key + searchParam + $input.value, renderSuggestions);
    }, 500);
  }

  $suggestionsView.hidden = false;
});

$suggestions.addEventListener('click', function (event) {
  if (event.target.matches('a')) {
    getData(event.target.getAttribute('data-url'), fillDetail);
    $featuredView.hidden = true;
    $detailView.hidden = false;
    $searchView.hidden = true;
  }
});

$form.addEventListener('submit', function (event) {
  event.preventDefault();
  getData(domain + key + searchParam + $input.value, renderCards);
  $viewLabel.textContent = 'Search Results';
  pageNumberResults = 1;
  $pageNumTop.textContent = pageNumberResults;
  $pageNumBot.textContent = pageNumberResults;
  $backLinkView.hidden = false;
  $backButton.hidden = true;
  $featuredView.hidden = false;
  $detailView.hidden = true;
  $searchView.hidden = true;
  view = 'results';
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

  $input.value = null;
  $suggestions.replaceChildren();
  $suggestionsView.hidden = true;
}

$searchIcon.addEventListener('click', toggleModal);
$exitButton.addEventListener('click', toggleModal);

// BOOKMARKS VIEW
function renderBookmarks(array) {
  $featuredGames.replaceChildren();

  for (var i = 0; i < array.length; i++) {
    $featuredGames.appendChild(
      createDomTree('div', { class: 'card-wrapper col-50' }, [
        createDomTree('div', {
          class: 'card-featured row',
          'data-url': domain + '/' + array[i].slug + key
        }, [
          createDomTree('div', { class: 'col-100' }, [
            createDomTree('div', { class: 'row' }, [
              createDomTree('div', { class: 'card-thumbnail-featured col-100' }, [
                createDomTree('img', {
                  src: array[i].background_image,
                  alt: array[i].name
                })])]),
            createDomTree('div', { class: 'row' }, [
              createDomTree('div', { class: 'card-title-featured col-100' }, [
                createDomTree('h4', {
                  class: 'text-center',
                  textContent: array[i].name
                })])])])])]));
  }
}

$bookmarkIconHeader.addEventListener('click', function (event) {
  renderBookmarks(data.bookmarks);
  $viewLabel.textContent = 'Bookmarks';
  $pageLabel.hidden = true;
  $pageNumTop.hidden = true;
  $backButton.hidden = true;
  $pageNumBot.hidden = true;
  $nextButton.hidden = true;
  $backLinkView.hidden = false;
  $featuredView.hidden = false;
  $detailView.hidden = true;
  view = 'bookmarks';
});

$bookmarkAction.addEventListener('click', function (event) {
  var index = data.bookmarks.findIndex(function (object) {
    return object.slug === data.currentDetail.slug;
  });

  if (index === -1) {
    $bookmarkAction.className = 'bookmark-action fas fa-bookmark';
    data.bookmarks.push(data.currentDetail);
  } else {
    $bookmarkAction.className = 'bookmark-action far fa-bookmark';
    data.bookmarks.splice(index, 1);
  }
});

// NAVIGATION
function goToFeatured() {
  $featuredGames.replaceChildren();
  getData(domain + key + pageParam + pageNumberFeat, renderCards);

  if (view === 'results') {
    $backLinkView.hidden = true;
    $pageNumBot.hidden = false;
  }

  if (view === 'detail' || view === 'bookmarks') {
    $pageLabel.hidden = false;
    $pageNumTop.hidden = false;
    $pageNumBot.hidden = false;
    $backLinkView.hidden = true;
    $featuredView.hidden = false;
    $detailView.hidden = true;
  }

  if (pageNumberFeat === 1) {
    $backButton.hidden = true;
  } else {
    $backButton.hidden = false;
  }

  if (nextPageUrl === null) {
    $nextButton.hidden = true;
  } else {
    $nextButton.hidden = false;
  }

  $viewLabel.textContent = 'Featured';
  $pageNumTop.textContent = pageNumberFeat;
  $pageNumBot.textContent = pageNumberFeat;
  $featuredView.hidden = false;
  $detailView.hidden = true;
  view = 'featured';
}

$backLinkFeat.addEventListener('click', goToFeatured);
$backLinkDetail.addEventListener('click', goToFeatured);
$backLinkView.addEventListener('click', goToFeatured);
$topLinkDetail.addEventListener('click', function (event) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

getData(domain + key + pageParam + pageNumberFeat, renderCards);
