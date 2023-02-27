const { resolveObjectURL } = require('buffer');
const express = require('express');
const csv = require('csv-parser');
const { Pool } = require('pg');
const fs = require('fs');
const app = express();
const https = require('https');

const connectionString = 'postgres://demo_v4fh_user:Kt1ZK2od2drdBKX5FNlXN5uhsLUPovJ0@dpg-cfub7a1a6gdotcah7hb0-a.oregon-postgres.render.com/demo_v4fh';

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  }
});
  
app.get('/branch', async (req, res) => {
    try {
      const { q, limit, offset } = req.query;
      const results = [];
      const client = await pool.connect();
      const query = `SELECT ifsc, bank_id, branch, address, city, district, state
                     FROM ta
                     WHERE LOWER(branch) LIKE '%${q.toLowerCase()}%'
                     ORDER BY ifsc DESC`;
      const dbRes = await client.query(query);
      // console.log(dbRes);
      dbRes.rows.forEach(row => {
          // console.log(Object.values(row))
          
            results.push(row);
              // console.log("Check")
          
          // console.log(results);
      });
      client.release();
      if (results.length === 0) {
        res.status(404).send('Bank details not found');
      } else {
        const response = results.slice(Number(offset)-1, Number(limit));
        console.log(response.length);
        let r = {
          "branches":response
        }
        res.json(r);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.get('/search', async (req, res) => {
    try {
      const { q, limit, offset } = req.query;
      const results = [];
      const client = await pool.connect();
      const query = `SELECT ifsc, bank_id, branch, address, city, district, state
                     FROM ta
                     ORDER BY ifsc ASC`;
      const dbRes = await client.query(query);
      // console.log(dbres);
      dbRes.rows.forEach(row => {
          var flag=0;
          for(let i of Object.values(row)){
              // console.log(i)
              if (i.toLowerCase().includes(q.toLowerCase())){
                  flag=1;
              }
          }
          if(flag == 1){
              results.push(row);
              // console.log("Check")
          }
      });
      client.release();
      if (results.length === 0) {
        res.status(404).send('Bank details not found');
      } else {
        const response = results.slice(Number(offset)-1, Number(limit));
        console.log(response.length);
        console.log(results.length);
        let r = {
          "branches":response
        }
        res.json(r);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
  
