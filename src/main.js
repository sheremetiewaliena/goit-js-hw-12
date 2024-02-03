import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import refs from './js/refs';
import axios from 'axios';

refs.loader.style.display = 'none';

axios.defaults.baseURL = 'https://pixabay.com/api';

const hiddenClass = 'is-hidden';

const queryParams = {
  query: '',
  page: 1,
  maxPage: 0,
  pageSize: 15,
};

const simplyGallery = new SimpleLightbox('.gallery-item a', {
  captionsData: 'alt',
  captionDelay: 250,
});

refs.form.addEventListener('submit', handleSearch);

async function handleSearch(event) {
  event.preventDefault();
  queryParams.page = 1;
  refs.gallery.innerHTML = '';

  refs.loadMoreBtn.classList.add(hiddenClass);
  queryParams.query = refs.form.query.value.trim();

  if (!queryParams.query) {
    createMessage(
      `The search field can't be empty! Please, enter your request!`
    );
    return;
  }
  try {
    const { hits, total } = await getImages(queryParams);
    queryParams.maxPage = Math.ceil(total / queryParams.page);

    createMarkup(hits, refs.gallery);

    if (hits.length > 0) {
      refs.loadMoreBtn.classList.remove(hiddenClass);
      refs.loadMoreBtn.addEventListener('click', onLoadMore);
    } else {
      refs.loadMoreBtn.classList.add(hiddenClass);
      createMessage(
        `Sorry, there are no images matching your search query. Please, try again!`
      );
    }
    showLoader(false);
  } catch (error) {
    console.log(error);
  } finally {
    refs.form.reset();
    if (queryParams.page === queryParams.maxPage) {
      refs.loadMoreBtn.classList.add(hiddenClass);
      createMessage(
        "We're sorry, but you've reached the end of search results!"
      );
    }
  }
}

async function onLoadMore() {
  queryParams.page += 1;
  try {
    showLoader(true);
    refs.loadMoreBtn.classList.add(hiddenClass);
    const { hits } = await getImages(queryParams.query, queryParams.page);
    createMarkup(hits, refs.gallery);
    showLoader(false);

    scrollImg();

    refs.loadMoreBtn.classList.remove(hiddenClass);
  } catch (error) {
    console.log(error);
  } finally {
    if (queryParams.page === queryParams.maxPage) {
      refs.loadMoreBtn.classList.add(hiddenClass);
      createMessage(
        "We're sorry, but you've reached the end of search results!"
      );
    }
  }
}

async function getImages(page = 1) {
  showLoader(true);
  return axios.get('/', {
    params: {
      key: refs.API_KEY,
      q: queryParams.query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 15,
      page,
    },
  });
}

function createMarkup(hits) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `
        <li class="gallery-item">
  <a class="gallery-link" href="${largeImageURL}">
    <img
      class="gallery-image"
      src="${webformatURL}"
      alt="${tags}"
    />
    <p class="gallery-descr">likes: <span class="descr-span">${likes}</span> views: <span class="descr-span">${views}</span> comments: <span class="descr-span">${comments}</span> downloads: <span class="descr-span">${downloads}</span></p>
  </a>
</li>`
    )
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simplyGallery.refresh();
}

function createMessage(message) {
  iziToast.show({
    class: 'error-svg',
    position: 'topRight',
    icon: 'error-svg',
    message: message,
    maxWidth: '432',
    messageColor: '#fff',
    messageSize: '16px',
    backgroundColor: '#EF4040',
    close: false,
    closeOnClick: true,
  });
}

function showLoader(state = true) {
  refs.loader.style.display = !state ? 'none' : 'inline-block';
}

function scrollImg() {
  const rect = document.querySelector('.gallery-link').getBoundingClientRect();
  window.scrollBy({ top: rect.height * 2, left: 0, behavior: 'smooth' });
}
