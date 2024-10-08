const express = require('express')
const app = express()
var cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PROT || 5000


// middleWare 

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sa-fashion-8fc4b.web.app",
      "https://sa-fashion-8fc4b.firebaseapp.com",
    ],
    credentials: true,
    optionsSuccessStatus: 200
  })
);


app.use(express.json())




// Mongodb Connection Here
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aq01puw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const productCollection = client.db("SA-Fashion").collection('products');



    // get all product api
    app.get('/product', async (req, res) => {
      const filter = req.query;
      console.log(filter);
  
      
      const searchTerm = filter.searching ? String(filter.searching) : '';
  
      const query = {
          ProductName: { $regex: searchTerm, $options: 'i' }
      };
  
      const options = {
          sort: {
              Price: filter.sort === 'asc' ? 1 : -1 
          }
      };
  
      try {
          const result = await productCollection.find(query, options).toArray();
          res.send(result);
      } catch (error) {
          console.error('Error fetching products:', error);
          res.status(500).send('Internal Server Error');
      }
  });
  


     // get all product api for pagination
     app.get('/all-product', async (req, res) => {
      const size = parseInt(req.query.size) || 10; // Default size
      const page = parseInt(req.query.page) - 1 || 0; // Default page
      const filter = req.query.filter || null;
      const sort = req.query.sort || null;
      const search = req.query.search || ''; // Default empty string if search is undefined
  
      let query = {
          ProductName: { $regex: search, $options: 'i' } // Ensure search is a string
      };
  
      if (filter) query.category = filter;
  
      let options = {};
      if (sort) options = { sort: { ProductCreationDateTime: sort === 'asc' ? 1 : -1 } };
  
      try {
          const result = await productCollection.find(query, options)
              .skip(page * size)
              .limit(size)
              .toArray();
          res.send(result);
      } catch (error) {
          console.error(error);
          res.status(500).send("An error occurred while fetching products.");
      }
  });
  
       // get all product api for count
    app.get('/product-count', async(req,res)=>{
    
      const count = await productCollection.countDocuments();
      res.send({count});
      })
    

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// testing api
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/fashion', (req,res)=>{
    res.send('Fashion is runningggg')
})

app.listen(port, () => {
  console.log(`SA-Fashion listening on port ${port}`)
})