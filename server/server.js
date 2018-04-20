'use strict';

// import { constants } from 'fs';


// const Promise = require('bluebird');
// custom logger
const log = require('./logger.js');
const express = require('express');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');
const Schema = mongoose.Schema;


const cassandra = require('cassandra-driver');
// var async = require('async');
const client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'test' });

const app = express();
// app.set('view engine', 'html');
// app.set('views', './../public/')

app.use(require('helmet')()); // use helmet
app.use(require('cors')()); // enable CORS
// serves all static files in /public
app.use(express.static(`${__dirname}/../public`));
const port = process.env.PORT || 8000;
const server = require('http').Server(app);

// start server
server.listen(port, () => {
  log.info(`Listening on port ${port}`);
});

// 'body-parser' middleware for POST
const bodyParser = require('body-parser');
// create application/json parser
const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
/*
const urlencodedParser = bodyParser.urlencoded({
  extended: false,
});
*/

function handleError(err) {
  console.log(err);
}

const personSchema = Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  age: Number,
  stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
});

const storySchema = Schema({
  author: { type: Schema.Types.ObjectId, ref: 'Person' },
  title: String,
  fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }],
  tags: [{ type: String }],
});

const Story = mongoose.model('Story', storySchema);
const Person = mongoose.model('Person', personSchema);

app.get('/api/people', jsonParser, (req, res) => {
  // if (!req.body) return res.sendStatus(400);
  Person.find({}, (err, people) => {
    if (err) return handleError(err);
    return res.json(people); // create user in req.body
  });
});

app.get('/api/stories', jsonParser, (req, res) => {
  // if (!req.body) return res.sendStatus(400);
  Story.find({})
    .populate('author')
    .exec((err, stories) => {
      if (err) return handleError(err);
      return res.json(stories); // create user in req.body
    });
});

app.post('/api/stories', jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(404);
  const data = req.body;

  const story = new Story(data);

  story.save((err) => {
    if (err) return res.json(err);
    story.populate('author', (err, storyPopulate) => {
      if (err) return res.json(err);
      // thats it!
      return res.json(storyPopulate);
    });
  });
});

app.delete('/api/stories', jsonParser, (req, res) => {
  // if (!req.body) return res.sendStatus(400);
  Story.remove({}, (err) => {
    if (err) return handleError(err);
    return res.json({}); // create user in req.body
  });
});

app.delete('/api/story', jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(404);
  const data = req.body;

  Story.remove({ _id: data._id }, (err, story) => {
    if (err) return handleError(err);
    Story.find({})
      .populate('author')
      .exec((err, stories) => {
        if (err) return handleError(err);
        return res.json(stories); // create user in req.body
      });
  });
});


app.put('/api/story', jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(404);
  const data = req.body;

  Story.update(
    {
      _id: data._id,
    },
    {
      $set: {
        title: data.title,
        tags: data.tags,
        author: data.author._id,
      },
    }, (err, story) => {
      if (err) return handleError(err);
      return res.json(story); // create user in req.body
    },
  );
});

app.delete('/api/tag', jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(404);
  const data = req.body;

  Story.findOne({ tags: { $elemMatch: { $in: [data.name] } } }, (errFindOne, story) => {
    if (errFindOne) return handleError(errFindOne);
    // return res.json(story); // create user in req.body
    if (story === null) {
      client.execute('DELETE FROM test.tags WHERE id = ?;', [data.id], (errDelete, resultDelete) => {
        if (errDelete) return res.json(errDelete);
        // thats it!
        client.execute('SELECT * FROM tags', (errSelect, resultSelect) => {
          if (errSelect) return handleError(errSelect);
          return res.json(resultSelect.rows);
        });
      });
    } else {
      res.status(404).json({ message: 'No se puede borrar el tag' });
    }
  });
});

app.get('/api/tags', jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(404);
  // const data = req.body;

  // cqlsh
  // DESCRIBE KEYSPACES
  // CREATE KEYSPACE test WITH REPLICATION = { 'class': 'SimpleStrategy', 'replication_factor': 3 };
  // CREATE TABLE test.tags ( id UUID PRIMARY KEY, name text );
  // insert into test.tags (id, name) values(now(), 'bueno');


  client.execute('SELECT * FROM tags', (err, result) => {
    if (err) return handleError(err);
    return res.json(result.rows);
  });
});

app.post('/api/tags', jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(404);
  const data = req.body;

  client.execute('insert into test.tags (id, name) values(now(), ?);', [data.name], (errInsert, result) => {
    if (errInsert) return res.json(errInsert);
    // thats it!
    client.execute('SELECT * FROM tags', (errSelect, result) => {
      if (errSelect) return handleError(errSelect);
      return res.json(result.rows);
    });
  });
});
