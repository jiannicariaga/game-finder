var domain = 'https://api.rawg.io/api/games';
var key = '?key=76e41dc99b8042e0b6f0cd116d9dadc1';
var pageParam = '&page=';
var searchParam = '&search=';
var placeholderImg = 'images/placeholder-image.webp';
var currentView = 'featured';
var previousView = null;
var parentView = null;
var previousPageUrl = null;
var nextPageUrl = null;
var pageNumFeatured = 1;
var pageNumResults = 1;
var modalOn = false;
var timeoutId = null;
var $backLinkView = document.querySelector('[data-view="back-link"]');
var $featuredView = document.querySelector('[data-view="featured"]');
var $detailView = document.querySelector('[data-view="detail"]');
var $searchView = document.querySelector('[data-view="search"]');
var $suggestionsView = document.querySelector('[data-view="suggestions"]');
var $loadView = document.querySelector('[data-view="load"]');
var $errorView = document.querySelector('[data-view="error"]');
var $brandIcon = document.querySelector('.brand');
var $bookmarkIcon = document.querySelector('.bookmarks');
var $bookmarkAction = document.querySelector('.bookmark-action');
var $searchIcon = document.querySelector('.search');
var $input = document.querySelector('input');
var $suggestions = document.querySelector('.suggestions');
var $form = document.querySelector('form');
var $viewLabel = document.querySelector('.view-label');
var $pageLabel = document.querySelector('.page-label');
var $pageNumTop = document.querySelector('.page-num-top');
var $pageNumBottom = document.querySelector('.page-num-bot');
var $backButton = document.querySelector('.back-btn');
var $nextButton = document.querySelector('.next-btn');
var $exitButton = document.querySelector('.exit-btn');
var $backLink = document.querySelector('.back-arrow');
var $topLinkDetail = document.querySelector('.up-arrow');
var $featuredGames = document.querySelector('.featured-games');

function getData(url, task) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function (event) {
    task(xhr.response);
    $loadView.classList.add('hidden');
  });

  if (navigator.onLine) {
    xhr.send();
  } else {
    $errorView.classList.remove('hidden');
  }

  $loadView.classList.remove('hidden');
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
        $element.setAttribute(key, placeholderImg);
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

  if ((currentView === 'results' && !object.results.length) ||
  (currentView === 'results' && !$input.value.trim().length)) {
    $featuredGames.appendChild(
      generateDomTree('div', { class: 'col-100 text-center' }, [
        generateDomTree('p', { textContent: 'No matches found.' })
      ]));
    $nextButton.classList.add('hidden');
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

    if (object.results.length < 20) {
      $nextButton.classList.add('hidden');
    } else {
      previousPageUrl = object.previous;
      nextPageUrl = object.next;
    }

    $backLink.classList.remove('hidden');
  }

  $featuredView.classList.remove('hidden');
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
  $about.textContent = object.description_raw;
  $releaseDate.textContent = object.released;
  $website.href = object.website;
  renderDetailList($genre, object.genres);
  renderDetailList($developer, object.developers);
  renderDetailList($publisher, object.publishers);

  if (object.background_image !== null) {
    $banner.src = object.background_image;
    $banner.alt = object.name;
  } else {
    $banner.src = placeholderImg;
    $banner.alt = 'Placeholder Image';
  }

  if (object.esrb_rating !== null) {
    $esrbRating.textContent = object.esrb_rating.name;
  } else {
    $esrbRating.textContent = '';
  }

  if (isBookmarked(object) === -1) {
    $bookmarkAction.className = 'bookmark-action far fa-bookmark';
  } else {
    $bookmarkAction.className = 'bookmark-action fas fa-bookmark';
  }

  $detailView.classList.remove('hidden');
}

function renderDetailList(parentElement, array) {
  parentElement.replaceChildren();

  for (var i = 0; i < array.length; i++) {
    parentElement.appendChild(
      generateDomTree('li', { textContent: array[i].name })
    );
  }
}

function isBookmarked(object) {
  data.currentDetail = {
    background_image: object.background_image,
    name: object.name,
    slug: object.slug
  };

  return data.bookmarks.findIndex(function (object) {
    return object.slug === data.currentDetail.slug;
  });
}

function renderSuggestions(object) {
  $suggestions.replaceChildren();

  if (!$input.value.trim().length) {
    $suggestionsView.classList.add('hidden');
  } else if (!object.results.length) {
    $suggestions.appendChild(
      generateDomTree('li', {
        class: 'no-matches',
        textContent: 'No matches found.'
      }));
    $suggestionsView.classList.remove('hidden');
  } else {
    var length = (object.results.length < 10) ? object.results.length : 10;

    for (var i = 0; i < length; i++) {
      $suggestions.appendChild(
        generateDomTree('li', {}, [
          generateDomTree('a', {
            'data-url': domain + '/' + object.results[i].slug + key,
            textContent: object.results[i].name
          })]));
      $suggestionsView.classList.remove('hidden');
    }
  }
}

function renderBookmarks(array) {
  $featuredGames.replaceChildren();

  if (!array.length) {
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
  $suggestions.replaceChildren();
  $input.value = null;
  $suggestionsView.classList.add('hidden');

  if (!modalOn) {
    modalOn = !modalOn;
    $searchView.classList.remove('hidden');
  } else {
    modalOn = !modalOn;
    $searchView.classList.add('hidden');
  }
}

function goToPreviousView() {
  $featuredGames.replaceChildren();

  if (previousView === 'featured' || previousView === currentView) {
    goToFeatured();
  } else if (previousView === 'detail') {
    goToDetail();
  } else if (previousView === 'bookmarks') {
    goToBookmarks();
  } else if (previousView === 'results') {
    goToResults();
  }
}

function goToFeatured() {
  getData(domain + key + pageParam + pageNumFeatured, renderCards);
  currentView = 'featured';
  parentView = null;
  $viewLabel.textContent = 'Featured';
  $pageNumTop.textContent = pageNumFeatured;
  $pageNumBottom.textContent = pageNumFeatured;
  $backLinkView.classList.add('hidden');
  $pageNumBottom.classList.remove('hidden');
  $featuredView.classList.add('hidden');
  $detailView.classList.add('hidden');

  if (currentView === 'detail' || currentView === 'bookmarks') {
    $pageLabel.classList.remove('hidden');
  }

  if (pageNumFeatured === 1) {
    $backButton.classList.add('hidden');
  } else {
    $backButton.classList.remove('hidden');
  }

  if (nextPageUrl === null) {
    $nextButton.classList.add('hidden');
  } else {
    $nextButton.classList.remove('hidden');
  }
}

function goToDetail() {
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (currentView === 'bookmarks') {
    previousView = 'bookmarks';
    parentView = 'bookmarks';
  } else {
    previousView = currentView;
  }

  if (parentView === 'bookmarks') {
    previousView = 'bookmarks';
  }

  currentView = 'detail';
  $backLinkView.classList.remove('hidden');
  $featuredView.classList.add('hidden');
  $detailView.classList.remove('hidden');
  $searchView.classList.add('hidden');
}

function goToBookmarks() {
  renderBookmarks(data.bookmarks);
  currentView = 'bookmarks';
  $viewLabel.textContent = 'Bookmarks';
  $pageLabel.classList.add('hidden');
  $backButton.classList.add('hidden');
  $pageNumBottom.classList.add('hidden');
  $nextButton.classList.add('hidden');
  $backLinkView.classList.remove('hidden');
  $featuredView.classList.remove('hidden');
  $detailView.classList.add('hidden');
}

function goToResults() {
  getData(domain + key + searchParam + $input.value, renderCards);
  currentView = 'results';
  $viewLabel.textContent = 'Search Results';
  $pageNumTop.textContent = pageNumResults;
  $pageNumBottom.textContent = pageNumResults;
  $backLinkView.classList.remove('hidden');
  $featuredView.classList.add('hidden');
  $detailView.classList.add('hidden');
  $searchView.classList.add('hidden');

  if (pageNumResults === 1) {
    $backButton.classList.add('hidden');
  } else {
    $backButton.classList.remove('hidden');
  }

  if (nextPageUrl === null) {
    $nextButton.classList.add('hidden');
  } else {
    $nextButton.classList.remove('hidden');
  }
}

$featuredGames.addEventListener('click', function (event) {
  if (event.target.closest('.card-feat')) {
    getData(event.target.closest('.card-feat').getAttribute('data-url'), fillDetail);
    goToDetail();
  }
});

$bookmarkIcon.addEventListener('click', function (event) {
  previousView = currentView;
  goToBookmarks();
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

$input.addEventListener('keyup', function (event) {
  if (event && timeoutId !== null) {
    clearTimeout(timeoutId);
  } else {
    $suggestionsView.classList.add('hidden');
  }

  timeoutId = setTimeout(function () {
    getData(domain + key + searchParam + $input.value, renderSuggestions);
  }, 500);
});

$suggestions.addEventListener('click', function (event) {
  if (event.target.matches('a')) {
    getData(event.target.getAttribute('data-url'), fillDetail);
    previousView = currentView;
    goToDetail();
  }
});

$form.addEventListener('submit', function (event) {
  event.preventDefault();
  previousView = currentView;
  pageNumResults = 1;
  goToResults();
});

$brandIcon.addEventListener('click', function (event) {
  pageNumFeatured = 1;
  goToFeatured();
});

$backButton.addEventListener('click', function (event) {
  getData(previousPageUrl, renderCards);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $nextButton.classList.remove('hidden');
  $featuredView.classList.add('hidden');

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
    $backButton.classList.add('hidden');
  }
});

$nextButton.addEventListener('click', function (event) {
  getData(nextPageUrl, renderCards);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $backButton.classList.remove('hidden');
  $featuredView.classList.add('hidden');

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
    $nextButton.classList.add('hidden');
  }
});

$topLinkDetail.addEventListener('click', function (event) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

$searchIcon.addEventListener('click', toggleModal);
$exitButton.addEventListener('click', toggleModal);
$backLink.addEventListener('click', goToPreviousView);

getData(domain + key + pageParam + pageNumFeatured, renderCards);
