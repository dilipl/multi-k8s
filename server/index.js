const keys = require("./keys");

//Express setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Postgres client setup
const { Pool } = require("pg");
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('connect', () => {
    pgClient
      .query('CREATE TABLE IF NOT EXISTS values (number INT)')
      .catch((err) => console.log(err));
});

//Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

// Apparently we do dublicates to publish and subscribe
const redisPublisher = redisClient.duplicate();

//Express route handlers
app.get('/', (req,res) =>{
    res.send("Hi");
});

app.get('/values/all', async (req,res) =>{
    const values = await pgClient.query('Select * from values');
    res.send(values.rows);
});

app.get('/values/current', async (req,res) =>{
    const values = redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', (req,res) =>{
    const index = req.body.index;
    if (parseInt(index) > 40) {
        res.status(422).send("Index too high");
    }

    redisClient.hset('values', index, 'Nothing yet');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT into values(number) VALUES($1)', [index]);

    res.send({working: true});
});

app.listen(5000, err => {
    console.log('Listening');
});