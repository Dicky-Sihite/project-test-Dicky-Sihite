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
    const pageNumber = parseInt(req.query['page[number]']) || 1;
    const pageSize = parseInt(req.query['page[size]']) || 10;
    const sort = req.query.sort || '-published_at';

    const url = `${SUITMEDIA_API}?page[number]=${pageNumber}&page[size]=${pageSize}&append[]=small_image&append[]=medium_image&sort=${sort}`;

    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const total = response.data.meta.total;

    res.json({
      data: response.data.data,
      meta: {
        pagination: {
          total,
          per_page: pageSize,
          current_page: pageNumber,
          total_pages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error('Gagal ambil data:', error.response?.data || error.message);
    res.status(500).json({ error: 'Gagal ambil data dari API Suitmedia' });
  }
});


app.get('/image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('Missing image URL');

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://suitmedia.com/',
        'Origin': 'https://suitmedia.com/',
      }
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(500).send('Failed to fetch image');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});