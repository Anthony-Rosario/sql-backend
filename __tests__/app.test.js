require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns all skateboards', async() => {

      const expectation = [
        {
          'id': 1,
          'name': 'Bennett Emotional Baggage Deck',
          'description': 'Size: 8.125" Wheelbase: 14"',
          'category': 'skateboard',
          'price': 55,
          'owner_id': 1
        },
        {
          'id': 2,
          'name': 'Past-Forms',
          'description': 'Size: 8.25" Wheelbase: 14.25"',
          'category': 'skateboard',
          'price': 59,
          'owner_id': 1
        },
        {
          'id': 3,
          'name': 'Santa Cruz Delfino Tarot Card',
          'description': 'Size: 8.25" Wheelbase: 14"',
          'category': 'skateboard',
          'price': 65,
          'owner_id': 1
        },
        {
          'id': 4,
          'name': 'Stranded Strand',
          'description': 'Components: 8.375” Gullwing Mission Trucks, ABEC 5 Greaseball Bearings',
          'category': 'longboard',
          'price': 189,
          'owner_id': 1
        },
        {
          'id': 5,
          'name': 'Landyatchz Totem Paradise',
          'description': 'Components: Hawgs 63mm 78a wheels, Bear Space Balls ABEC 7 Bearings',
          'category': 'longboard',
          'price': 179,
          'owner_id': 1
        },
        {
          'id': 6,
          'name': 'DB Longboards Pioneer',
          'description': 'Components: Cloud Ride Cruiser 69mm 78a wheels, Cloud Ride bearings',
          'category': 'longboard',
          'price': 189,
          'owner_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/skateboards')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single skateboard', async() => {

      const expectation = {
        'id': 1,
        'name': 'Bennett Emotional Baggage Deck',
        'description': 'Size: 8.125" Wheelbase: 14"',
        'category': 'skateboard',
        'price': 55,
        'owner_id': 1
      };

      const data = await fakeRequest(app)
        .get('/skateboards/1')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(data.body).toEqual(expectation);
      
      const nothing = await fakeRequest(app)
        .get('/skateboards/100')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });
  });
});
