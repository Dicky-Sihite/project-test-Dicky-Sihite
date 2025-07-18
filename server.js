const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const SUITMEDIA_API = 'https://suitmedia-backend.suitdev.com/api/ideas';

app.get('/api/ideas', async (req, res) => {
  try {
    const pageNumber = req.query['page[number]'] || 1;
    const pageSize = req.query['page[size]'] || 10;
    const sort = req.query.sort || '-published_at';

    const url = `${SUITMEDIA_API}?page[number]=${pageNumber}&page[size]=${pageSize}&append[]=small_image&append[]=medium_image&sort=${sort}`;

    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Kirim kembali data + meta untuk pagination
    res.json({
    data: response.data.data,
    meta: {
        pagination: {
        total: response.data.meta.total,
        per_page: response.data.meta.per_page,
        current_page: Number(pageNumber),
        total_pages: Math.ceil(response.data.meta.total / pageSize)
        }
    }
    });

  } catch (error) {
    console.error('Gagal ambil data:', error.response?.data || error.message);
    res.status(500).json({ error: 'Gagal ambil data dari API Suitmedia' });
  }
});

app.listen(PORT, () => {
  console.log(` Server berjalan di http://localhost:${PORT}`);
});
