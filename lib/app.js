const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/skateboards', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT 
      skateboards.id,
      skateboards.name,
      skateboards.description,
      skateboards.price,
      category_id,
      skateboards.owner_id
    from skateboards
    JOIN categories
    ON skateboards.category_id = categories.id
    `);
    
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/categories', async(req, res) => {
  try {
    const data = await client.query('SELECT * from categories');

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.get('/skateboards/:id', async(req, res) => {
  try {

    const id = req.params.id;
    const data = await client.query(`
    SELECT
      skateboards.id,
      skateboards.name,
      skateboards.description,
      category_id,
      skateboards.price,
      skateboards.owner_id
    from skateboards
    JOIN categories
    ON skateboards.category_id = categories.id
    WHERE skateboards.id=$1`, [id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


app.delete('/skateboards/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('DELETE from skateboards where id=$1 RETURNING *', [id]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/skateboards', async(req, res) => {
  try {
    const data = await client.query(`
    INSERT INTO skateboards (name, description, category_id, price, owner_id)
    values ($1, $2, $3, $4, $5)
    RETURNING *;
    `,
    [
      req.body.name,
      req.body.description,
      req.body.category_id, 
      req.body.price,
      1
    ]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


app.put('/skateboards/:id', async(req, res) => {
  const id = req.params.id;

  try {
    const data = await client.query(`
    update skateboards
    SET name = $1, description = $2, category_id = $3, price = $4
    WHERE id = $5
    returning *;
    `,
    [
      req.body.name,
      req.body.description,
      req.body.category_id,
      req.body.price,
      id,
    ]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;