const client = require('../lib/client');
// import our seed data:
const skateboards = require('./skateboards.js');
const usersData = require('./users.js');
const categoriesData = require('./categories.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
    
    
    await Promise.all(
      categoriesData.map(category => {
        return client.query(`
                      INSERT INTO categories (name)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [category.name]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      skateboards.map(board => {
        return client.query(`
                    INSERT INTO skateboards (name, description, category_id, price, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [
          board.name,
          board.description,
          board.category_id,
          board.price,
          user.id
        ]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
