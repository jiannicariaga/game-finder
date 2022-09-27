var url = 'https://api.rawg.io/api/games?key=76e41dc99b8042e0b6f0cd116d9dadc1';
var xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.responseType = 'json';
xhr.send();

function renderFeatured(event) {
  var $cardView = document.querySelector('.card-view');

  for (var i = 0; i < xhr.response.results.length; i++) {
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
    img.src = xhr.response.results[i].background_image;
    img.alt = xhr.response.results[i].name;
    thumbnail.appendChild(img);

    var row2 = document.createElement('div');
    row2.className = 'row';
    column1.appendChild(row2);

    var title = document.createElement('div');
    title.className = 'title col-100';
    row2.appendChild(title);

    var h4 = document.createElement('h4');
    h4.className = 'text-center';
    h4.textContent = xhr.response.results[i].name;
    title.appendChild(h4);
  }
}

xhr.addEventListener('load', renderFeatured);

// console.log(xhr.status);
// console.log('xhr.response:', xhr.response);
// console.log('.results:', xhr.response.results);
// console.log('.next:', xhr.response.next);

// function nextPage(event) {
//   var $nextButton = document.querySelector('.next-button');

// }

// function backPage(event) {
//   var $backButton = document.querySelector('.back-button');

// }
