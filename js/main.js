var domain = 'https://api.rawg.io/api/games';
var key = '?key=76e41dc99b8042e0b6f0cd116d9dadc1';
var pageParam = '&page=';
var searchParam = '&search=';
var placeholderImg = 'images/placeholder.webp';
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
var $backLinkFeatured = document.querySelector('.back-arrow-feat');
var $backLinkDetail = document.querySelector('.back-arrow-detail');
var $topLinkDetail = document.querySelector('.up-arrow');
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

  if (currentView === 'results' && object.results.length === 0) {
    $featuredGames.appendChild(
      generateDomTree('div', { class: 'col-100 text-center' }, [
        generateDomTree('p', { textContent: 'No matches found.' })
      ]));
    $pageLabel.hidden = true;
    $pageNumBottom.hidden = true;
    $nextButton.hidden = true;
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
      $nextButton.hidden = true;
    } else {
      previousPageUrl = object.previous;
      nextPageUrl = object.next;
    }

    $backLinkFeatured.hidden = false;
  }

  $featuredView.hidden = false;
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

  $detailView.hidden = false;
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

  if ($input.value === '') {
    $suggestionsView.hidden = true;
  } else if (object.results.length === 0) {
    $suggestions.appendChild(
      generateDomTree('li', {
        class: 'no-matches',
        textContent: 'No matches found.'
      }));
  } else {
    for (var i = 0; i < object.results.length; i++) {
      $suggestions.appendChild(
        generateDomTree('li', {}, [
          generateDomTree('a', {
            'data-url': domain + '/' + object.results[i].slug + key,
            textContent: object.results[i].name
          })]));
      $suggestionsView.hidden = false;
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
  $suggestions.replaceChildren();
  $input.value = null;
  $suggestionsView.hidden = true;

  if (currentView !== 'search') {
    previousView = currentView;
    currentView = 'search';
    $searchView.hidden = false;
  } else {
    currentView = previousView;
    $searchView.hidden = true;
  }
}

function goToFeatured() {
  $featuredGames.replaceChildren();
  getData(domain + key + pageParam + pageNumFeatured, renderCards);
  currentView = 'featured';
  $viewLabel.textContent = 'Featured';
  $pageNumTop.textContent = pageNumFeatured;
  $pageNumBottom.textContent = pageNumFeatured;
  $backLinkView.hidden = true;
  $pageNumBottom.hidden = false;
  $featuredView.hidden = true;
  $detailView.hidden = true;

  if (currentView === 'detail' || currentView === 'bookmarks') {
    $pageLabel.hidden = false;
  }

  if (currentView === 'results') {
    $nextButton.hidden = false;
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
}

$featuredGames.addEventListener('click', function (event) {
  if (event.target.closest('.card-feat')) {
    getData(event.target.closest('.card-feat').getAttribute('data-url'), fillDetail);
    window.scrollTo({ top: 0, behavior: 'instant' });
    currentView = 'detail';
    $featuredView.hidden = true;
  }
});

$bookmarkIcon.addEventListener('click', function (event) {
  renderBookmarks(data.bookmarks);
  currentView = 'bookmarks';
  $viewLabel.textContent = 'Bookmarks';
  $pageLabel.hidden = true;
  $backButton.hidden = true;
  $pageNumBottom.hidden = true;
  $nextButton.hidden = true;
  $backLinkView.hidden = false;
  $featuredView.hidden = false;
  $detailView.hidden = true;
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
    timeoutId = setTimeout(function () {
      getData(domain + key + searchParam + $input.value, renderSuggestions);
    }, 500);
  } else {
    timeoutId = setTimeout(function () {
      getData(domain + key + searchParam + $input.value, renderSuggestions);
    }, 500);
    $suggestionsView.hidden = true;
  }
});

$suggestions.addEventListener('click', function (event) {
  if (event.target.matches('a')) {
    getData(event.target.getAttribute('data-url'), fillDetail);
    currentView = 'detail';
    $featuredView.hidden = true;
    $detailView.hidden = true;
    $searchView.hidden = true;
  }
});

$form.addEventListener('submit', function (event) {
  event.preventDefault();
  getData(domain + key + searchParam + $input.value, renderCards);
  currentView = 'results';
  pageNumResults = 1;
  $viewLabel.textContent = 'Search Results';
  $pageNumTop.textContent = pageNumResults;
  $pageNumBottom.textContent = pageNumResults;
  $backLinkView.hidden = false;
  $featuredView.hidden = true;
  $detailView.hidden = true;
  $searchView.hidden = true;
});

$brandIcon.addEventListener('click', function (event) {
  pageNumFeatured = 1;
  goToFeatured();
});

$backButton.addEventListener('click', function (event) {
  getData(previousPageUrl, renderCards);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $nextButton.hidden = false;
  $featuredView.hidden = true;

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
  $featuredView.hidden = true;

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

$topLinkDetail.addEventListener('click', function (event) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

$searchIcon.addEventListener('click', toggleModal);
$exitButton.addEventListener('click', toggleModal);
$backLinkFeatured.addEventListener('click', goToFeatured);
$backLinkDetail.addEventListener('click', goToFeatured);
$backLinkView.addEventListener('click', goToFeatured);

getData(domain + key + pageParam + pageNumFeatured, renderCards);
