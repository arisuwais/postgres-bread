const express = require('express');
const router = express.Router();

module.exports = function (pool) {

  // pool.query('select * from bread', (err, res) => {
  //   console.log(res);

  // })

  router.get('/', function (req, res, next) {
    let params = [];
    let isFilter = false;

    if (req.query.checkid && req.query.formid) {
      params.push(`id=${req.query.formid}`);
      isFilter = true;
    }

    if (req.query.checkstring && req.query.formstring) {
      params.push(`string like '%${req.query.formstring}%'`);
      isFilter = true;
    }

    if (req.query.checkinteger && req.query.forminteger) {
      params.push(`integer=${req.query.forminteger}`);
      isFilter = true;
    }

    if (req.query.checkfloat && req.query.formfloat) {
      params.push(`float=${req.query.formfloat}`);
      isFilter = true;
    }

    if (req.query.checkdate && req.query.formdate && req.query.formenddate) {
      params.push(`date between '${req.query.formdate}' and '${req.query.formenddate}'`);
      isFilter = true;
    }

    if (req.query.checkboolean && req.query.boolean) {
      params.push(`boolean='${req.query.boolean}'`);
      isFilter = true;
    }

    let sql = `select count(*) as total from bread`;
    if (isFilter) {
      sql += ` where ${params.join(' and ')}`
    }

    pool.query(sql, (err, count) => {
      const page = req.query.page || 1;
      const limit = 5;
      const offset = (page - 1) * limit;
      const url = req.url == '/' ? '/?page=1' : req.url
      const total = count.rows[0].total;
      const pages = Math.ceil(total / limit);
      sql = `select * from bread`;
      if (isFilter) {
        sql += ` where ${params.join(' and ')} `
      }
      sql += ` ORDER BY id ASC limit ${limit} offset ${offset} `;
      pool.query(sql, (err, data) => {
        res.render('index', {
          rows: data.rows,
          page,
          pages,
          query: req.query,
          url
        });
      });
    });
  });

  router.post('/edit/:id', (req, res, next) => {
    let id = req.params.id;
    let string = req.body.string;
    let integer = parseInt(req.body.integer);
    let float = parseFloat(req.body.float);
    let date = req.body.date;
    let boolean = req.body.boolean;
    pool.query(`UPDATE bread set string='${string}', integer=${integer}, float=${float}, date='${date}', boolean='${boolean}' where id=${id}`, (err) => {
      if (err) {
        console.error(err);
        return res.send(err)
      }
      console.log('upgrade success');
      res.redirect('/');
    })
  })


  router.get('/edit/:id', function (req, res, next) {
    let id = req.params.id;
    pool.query(`SELECT * FROM bread WHERE id=${id}`, (err, data) => {
      res.render('edit', {
        item: data.rows[0],
        id: id
      })
    })
  });

  router.get('/add', (req, res) => {
    res.render('add');
  })

  router.post('/add', (req, res) => {
    let string = req.body.string;
    let integer = parseInt(req.body.integer);
    let float = parseFloat(req.body.float);
    let date = req.body.date;
    let boolean = req.body.boolean;
    pool.query(`INSERT INTO bread(string, integer, float, date, boolean) VALUES ('${string}',${integer},${float},'${date}',${boolean})`, (err) => {
      if (err) {
        console.error(err);
        return res.send(err)
      }
      console.log('add success');
      res.redirect('/');
    })
  })

  router.get('/delete/:id', function (req, res, next) {
    let id = req.params.id;
    pool.query(`delete from bread where id= ${id}`,
      req.body.id, (err) => {
        if (err) {
          console.error(err.messsage);
        }
        console.log('delete success');
        res.redirect('/');
      })
  });

  return router;
}