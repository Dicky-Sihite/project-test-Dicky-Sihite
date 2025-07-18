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

async function fetchPosts() {
  try {
    const url = `/api/ideas?page[number]=${currentPage}&page[size]=${perPage}&sort=${sort}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Data tidak valid.');
    }

    renderPosts(data.data);

    const paginationData = data.meta?.page;
    if (paginationData) {
      renderPagination(paginationData);
      updateRangeInfo(paginationData);
    }

  } catch (e) {
    console.error('Gagal memuat data:', e);
    postList.innerHTML = '<p>Failed to load posts.</p>';
  }
}

function renderPosts(posts) {
  postList.innerHTML = posts.map(post => `
    <div class="card">
      <img src="${post.medium_image?.[0]?.url || ''}" alt="${post.title}" loading="lazy">
      <div class="card-body">
        <div class="card-date">${formatDate(post.published_at)}</div>
        <div class="card-title">${post.title}</div>
      </div>
    </div>
  `).join('');
}

function renderPagination({ total_pages, current_page }) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const prevBtn = document.createElement('button');
  prevBtn.innerHTML = '&laquo;';
  prevBtn.disabled = current_page === 1;
  prevBtn.onclick = () => {
    if (current_page > 1) {
      currentPage--;
      saveState();
      fetchPosts();
    }
  };
  pagination.appendChild(prevBtn);

  // Nomor halaman
  for (let i = 1; i <= total_pages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === current_page) btn.classList.add('active');
    btn.onclick = () => {
      currentPage = i;
      saveState();
      fetchPosts();
    };
    pagination.appendChild(btn);
  }

  // Tombol berikutnya
  const nextBtn = document.createElement('button');
  nextBtn.innerHTML = '&raquo;';
  nextBtn.disabled = current_page === total_pages;
  nextBtn.onclick = () => {
    if (current_page < total_pages) {
      currentPage++;
      saveState();
      fetchPosts();
    }
  };
  pagination.appendChild(nextBtn);
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
  fetchPosts();
};

perPageSelect.onchange = () => {
  perPage = parseInt(perPageSelect.value);
  currentPage = 1;
  saveState();
  fetchPosts();
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

  // Parallax effect
  if (bannerBg) {
    bannerBg.style.transform = `translateY(${currentScroll * 0.3}px)`;
  }
  if (bannerContent) {
    bannerContent.style.transform = `translateY(calc(-50% + ${currentScroll * 0.15}px))`;
  }
});

fetchPosts();
