var domain = 'https://api.rawg.io/api/games';
var key = '?key=76e41dc99b8042e0b6f0cd116d9dadc1';
var pageParam = '&page=';
var searchParam = '&search=';
var placeholderImage = 'images/placeholder.webp';
var currentView = 'featured';
var previousView = null;
var previousPageUrl = null;
var nextPageUrl = null;
var pageNumFeatured = 1;
var pageNumResults = 1;
var timeoutId = null;
var $featuredView = document.querySelector('[data-view="featured"]');
var $backLinkView = document.querySelector('[data-view="back-link"]');
var $detailView = document.querySelector('[data-view="detail"]');
var $searchView = document.querySelector('[data-view="search"]');
var $suggestionsView = document.querySelector('[data-view="suggestions"]');
var $loadView = document.querySelector('[data-view="load"]');
var $viewLabel = document.querySelector('.view-label');
var $pageLabel = document.querySelector('.page-label');
var $pageNumTop = document.querySelector('.page-num-top');
var $pageNumBottom = document.querySelector('.page-num-bot');
var $backButton = document.querySelector('.back-btn');
var $nextButton = document.querySelector('.next-btn');
var $exitButton = document.querySelector('.exit-btn');
var $backLinkFeatured = document.querySelector('.back-arrow-feat');
var $backLinkDetail = document.querySelector('.back-arrow-detail');
var $topLinkDetail = document.querySelector('.up-arrow');
var $bookmarkIcon = document.querySelector('.bookmarks');
var $bookmarkAction = document.querySelector('.bookmark-action');
var $searchIcon = document.querySelector('.search');
var $form = document.querySelector('form');
var $input = document.querySelector('input');
var $suggestions = document.querySelector('.suggestions');
var $featuredGames = document.querySelector('.featured-games');

function getData(url, task) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function (event) {
    task(xhr.response);
    $loadView.hidden = true;
  });
  xhr.send();
  $loadView.hidden = false;
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

function renderCards(object) {
  $featuredGames.replaceChildren();

  if (currentView === 'results' && object.results.length === 0) {
    $featuredGames.appendChild(
      generateDomTree('div', { class: 'col-100 text-center' }, [
        generateDomTree('p', { textContent: 'No matches found.' })
      ]));
  } else {
    for (var i = 0; i < object.results.length; i++) {
      $featuredGames.appendChild(
        generateDomTree('div', { class: 'card-wrapper col-50' }, [
          generateDomTree('div', {
            class: 'card-feat row',
            'data-url': domain + '/' + object.results[i].slug + key
          }, [
            generateDomTree('div', { class: 'col-100' }, [
              generateDomTree('div', { class: 'row' }, [
                generateDomTree('div', { class: 'card-feat-image col-100' }, [
                  generateDomTree('img', {
                    src: object.results[i].background_image,
                    alt: object.results[i].name
                  })])]),
              generateDomTree('div', { class: 'row' }, [
                generateDomTree('div', { class: 'card-feat-title col-100' }, [
                  generateDomTree('h4', {
                    class: 'text-center',
                    textContent: object.results[i].name
                  })])])])])]));
    }

    previousPageUrl = object.previous;
    nextPageUrl = object.next;
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

function renderDetailList(parentElement, array) {
  parentElement.replaceChildren();

  for (var i = 0; i < array.length; i++) {
    parentElement.appendChild(
      generateDomTree('li', { textContent: array[i].name })
    );
  }
}

function renderSuggestions(object) {
  $suggestions.replaceChildren();

  if (object.results.length === 0) {
    $suggestions.appendChild(
      generateDomTree('li', {
        class: 'no-matches',
        textContent: 'No matches found.'
      }));
  } else {
    for (var i = 0; i < object.results.length; i++) {
      if (i === 10) {
        return;
      }

      $suggestions.appendChild(
        generateDomTree('li', {}, [
          generateDomTree('a', {
            'data-url': domain + '/' + object.results[i].slug + key,
            textContent: object.results[i].name
          })]));
    }
  }
}

function renderBookmarks(array) {
  $featuredGames.replaceChildren();

  if (array.length === 0) {
    $featuredGames.appendChild(
      generateDomTree('div', { class: 'col-100 text-center' }, [
        generateDomTree('p', { textContent: 'No bookmarks have been saved.' })
      ]));
  } else {
    for (var i = 0; i < array.length; i++) {
      $featuredGames.appendChild(
        generateDomTree('div', { class: 'card-wrapper col-50' }, [
          generateDomTree('div', {
            class: 'card-feat row',
            'data-url': domain + '/' + array[i].slug + key
          }, [
            generateDomTree('div', { class: 'col-100' }, [
              generateDomTree('div', { class: 'row' }, [
                generateDomTree('div', { class: 'card-feat-image col-100' }, [
                  generateDomTree('img', {
                    src: array[i].background_image,
                    alt: array[i].name
                  })])]),
              generateDomTree('div', { class: 'row' }, [
                generateDomTree('div', { class: 'card-feat-title col-100' }, [
                  generateDomTree('h4', {
                    class: 'text-center',
                    textContent: array[i].name
                  })])])])])]));
    }
  }
}

function toggleModal(event) {
  if (currentView !== 'search') {
    $searchView.hidden = false;
    previousView = currentView;
    currentView = 'search';
  } else {
    $searchView.hidden = true;
    currentView = previousView;
  }

  $suggestions.replaceChildren();
  $suggestionsView.hidden = true;
  $input.value = null;
}

function goToFeatured() {
  $featuredGames.replaceChildren();
  getData(domain + key + pageParam + pageNumFeatured, renderCards);

  if (currentView === 'results') {
    $backLinkView.hidden = true;
    $pageLabel.hidden = false;
    $pageNumBottom.hidden = false;
    $nextButton.hidden = false;
  }

  if (currentView === 'detail' || currentView === 'bookmarks') {
    $pageLabel.hidden = false;
    $pageNumTop.hidden = false;
    $pageNumBottom.hidden = false;
    $backLinkView.hidden = true;
    $featuredView.hidden = false;
    $detailView.hidden = true;
  }

  if (pageNumFeatured === 1) {
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
  $pageNumTop.textContent = pageNumFeatured;
  $pageNumBottom.textContent = pageNumFeatured;
  $featuredView.hidden = false;
  $detailView.hidden = true;
  currentView = 'featured';
}

$featuredGames.addEventListener('click', function (event) {
  if (event.target.closest('.card-feat')) {
    getData(event.target.closest('.card-feat').getAttribute('data-url'), fillDetail);
    window.scrollTo({ top: 0, behavior: 'instant' });
    $featuredView.hidden = true;
    $detailView.hidden = false;
    currentView = 'detail';
  }
});

$backButton.addEventListener('click', function (event) {
  getData(previousPageUrl, renderCards);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $nextButton.hidden = false;

  if (currentView === 'featured') {
    pageNumFeatured--;
    $pageNumTop.textContent = pageNumFeatured;
    $pageNumBottom.textContent = pageNumFeatured;
  } else if (currentView === 'results') {
    pageNumResults--;
    $pageNumTop.textContent = pageNumResults;
    $pageNumBottom.textContent = pageNumResults;
  }

  if ((currentView === 'featured' && pageNumFeatured === 1) ||
      (currentView === 'results' && pageNumResults === 1)) {
    $backButton.hidden = true;
  }
});

$nextButton.addEventListener('click', function (event) {
  getData(nextPageUrl, renderCards);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $backButton.hidden = false;

  if (currentView === 'featured') {
    pageNumFeatured++;
    $pageNumTop.textContent = pageNumFeatured;
    $pageNumBottom.textContent = pageNumFeatured;
  } else if (currentView === 'results') {
    pageNumResults++;
    $pageNumTop.textContent = pageNumResults;
    $pageNumBottom.textContent = pageNumResults;
  }

  if (nextPageUrl === null) {
    $nextButton.hidden = true;
  }
});

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
    currentView = 'detail';
  }
});

$form.addEventListener('submit', function (event) {
  event.preventDefault();
  getData(domain + key + searchParam + $input.value, renderCards);
  $viewLabel.textContent = 'Search Results';
  pageNumResults = 1;
  $pageNumTop.textContent = pageNumResults;
  $pageNumBottom.textContent = pageNumResults;
  $backLinkView.hidden = false;
  $pageLabel.hidden = false;
  $backButton.hidden = true;
  $pageNumBottom.hidden = false;
  $nextButton.hidden = false;
  $featuredView.hidden = false;
  $detailView.hidden = true;
  $searchView.hidden = true;
  currentView = 'results';
});

$bookmarkIcon.addEventListener('click', function (event) {
  renderBookmarks(data.bookmarks);
  $viewLabel.textContent = 'Bookmarks';
  $pageLabel.hidden = true;
  $pageNumTop.hidden = true;
  $backButton.hidden = true;
  $pageNumBottom.hidden = true;
  $nextButton.hidden = true;
  $backLinkView.hidden = false;
  $featuredView.hidden = false;
  $detailView.hidden = true;
  currentView = 'bookmarks';
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

$topLinkDetail.addEventListener('click', function (event) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

$searchIcon.addEventListener('click', toggleModal);
$exitButton.addEventListener('click', toggleModal);
$backLinkFeatured.addEventListener('click', goToFeatured);
$backLinkDetail.addEventListener('click', goToFeatured);
$backLinkView.addEventListener('click', goToFeatured);

getData(domain + key + pageParam + pageNumFeatured, renderCards);
