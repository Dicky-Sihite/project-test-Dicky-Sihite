const postList = document.getElementById('post-list');
const pagination = document.getElementById('pagination');
const sortSelect = document.getElementById('sort');
const perPageSelect = document.getElementById('per-page');
const rangeInfo = document.getElementById('range-info');
const bannerBg = document.querySelector('.banner-bg');
const bannerContent = document.querySelector('.banner-content');
const header = document.querySelector('header');

let currentPage = parseInt(localStorage.getItem('page')) || 1;
let perPage = parseInt(localStorage.getItem('perPage')) || 10;
let sort = localStorage.getItem('sort') || '-published_at';

sortSelect.value = sort;
perPageSelect.value = perPage;

async function fetchArticles() {
  try {
    const url = `/api/ideas?page[number]=${currentPage}&page[size]=${perPage}&sort=${sort}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Data tidak valid.');
    }

    renderArticles(data.data);

    const paginationData = data.meta?.pagination;
    if (paginationData) {
      renderPagination(paginationData);
      updateRangeInfo(paginationData);
    }

  } catch (e) {
    console.error('Gagal memuat data:', e);
    postList.innerHTML = '<p>Failed to load Articles.</p>';
  }
}

function renderArticles(articles) {
  postList.innerHTML = '';

  articles.forEach(item => {
    const article = document.createElement('div');
    article.classList.add('post-item');

    // Tanggal
    const date = document.createElement('p');
    date.innerText = formatDate(item.published_at);
    article.appendChild(date);

    // Gambar
    let imageUrl = '';
    if (item.medium_image?.[0]?.url) {
      imageUrl = item.medium_image[0].url;
    } else if (item.small_image?.[0]?.url) {
      imageUrl = item.small_image[0].url;
    }

    if (imageUrl) {
      const fullImageUrl = imageUrl.startsWith('http')
        ? imageUrl
        : `https://suitmedia-backend.suitdev.com${imageUrl}`;
      const img = document.createElement('img');
      img.src = `/image?url=${encodeURIComponent(fullImageUrl)}`;
      img.alt = item.title;
      img.loading = 'lazy';
      img.onerror = () => img.style.display = 'none';
      article.appendChild(img);
    }

    // Judul
    const title = document.createElement('h2');
    title.textContent = item.title;
    article.appendChild(title);

    postList.appendChild(article);
  });
}

function renderPagination(meta) {
  pagination.innerHTML = '';

  const totalPages = meta.total_pages;
  const current = meta.current_page;

  const createButton = (label, page, isActive = false, isDisabled = false) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.classList.add('pagination-btn');
    if (isActive) btn.classList.add('active');
    if (isDisabled) btn.disabled = true;
    if (!isActive && !isDisabled && typeof page === 'number') {
      btn.addEventListener('click', () => {
        currentPage = page;
        saveState();
        fetchArticles();
      });
    }
    return btn;
  };

  pagination.appendChild(createButton('«', current - 1, false, current === 1));

  let startPage = Math.max(1, current - 2);
  let endPage = startPage + 4;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pagination.appendChild(createButton(i, i, i === current));
  }

  pagination.appendChild(createButton('»', current + 1, false, current === totalPages));
}

function updateRangeInfo({ current_page, per_page, total }) {
  const start = (current_page - 1) * per_page + 1;
  const end = Math.min(total, start + per_page - 1);
  rangeInfo.textContent = `Showing ${start} - ${end} of ${total}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${d.toLocaleString('default', { month: 'long' }).toUpperCase()} ${d.getFullYear()}`;
}

function saveState() {
  localStorage.setItem('page', currentPage);
  localStorage.setItem('perPage', perPage);
  localStorage.setItem('sort', sort);
}

sortSelect.onchange = () => {
  sort = sortSelect.value;
  currentPage = 1;
  saveState();
  fetchArticles();
};

perPageSelect.onchange = () => {
  perPage = parseInt(perPageSelect.value);
  currentPage = 1;
  saveState();
  fetchArticles();
};

let lastScrollTop = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  if (currentScroll > lastScrollTop && currentScroll > 100) {
    header.classList.add('hidden');
  } else {
    header.classList.remove('hidden');
  }
  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;

  if (bannerBg) {
    bannerBg.style.transform = `translateY(${currentScroll * 0.3}px)`;
  }
  if (bannerContent) {
    bannerContent.style.transform = `translateY(calc(-50% + ${currentScroll * 0.15}px))`;
  }
});

fetchArticles();
