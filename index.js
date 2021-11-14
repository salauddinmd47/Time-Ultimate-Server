const express = require('express');
const cors = require("cors");
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 4000;

const uri =  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4mjee.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`; 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run(){
    try{
        await client.connect();
        console.log('database connect successfully')
        const database = client.db('Timeless')
        const watchCollection = database.collection('watches')
        const reviewsCollection = database.collection('reviews')
       const orderCollection = database.collection('orders')
       const userCollection = database.collection('users')
        // GET API
        // load products api 
        app.get('/products',async(req, res)=>{
            const products = watchCollection.find({})
            const result = await products.toArray()
            res.json(result)
        })
        // load product by id 
        app.get('/products/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await watchCollection.findOne(query)
            res.json(result)
        })
        // load reviews api 
        app.get('/reviews',async(req, res)=>{
            const reviews = reviewsCollection.find({})
            const result = await reviews.toArray()
            res.json(result)
        })
        // orders load api by email
        app.get('/orders',async(req ,res)=>{ 
            const email = req.query.email 
            const query = {email:email}
            const orders = orderCollection.find(query)
            const result = await orders.toArray()
            res.json(result)
            
        })
        // load all orders for manage 
        app.get('/allOrders',async(req ,res)=>{  
            const orders = orderCollection.find({})
            const result = await orders.toArray()
            res.json(result)
            
        })
        // checking whether user admin or not 
        app.get('/users/:email', async(req,res)=>{
            const email = req.params.email;
            const query = {email: email}
            const user = await userCollection.findOne(query)
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true
            }
            res.send({admin:isAdmin})
        })



        // POST API 

        // order api 
        app.post('/orders',async(req, res)=>{
            const product = req.body;
            const result = await orderCollection.insertOne(product)
            res.json(result)
        })
        // add reviews to db
        app.post('/reviews',async(req, res)=>{
            const review = req.body; 
            const result = await reviewsCollection.insertOne(review) 
            res.json(result)
        })
        // save user api in db 
        app.post('/users',async(req, res)=>{
            const user = req.body;
            const result = await userCollection.insertOne(user) 
            res.send(result)
        })
        // add new product 
        app.post('/products',async(req, res)=>{
            const product = req.body;
            const result = await watchCollection.insertOne(product)
            res.json(result)
        })

        // DELETE API 
        app.delete('/orders/:id',async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
             const result = await orderCollection.deleteOne(query)
             res.json(result)
        })
        // delete product from watch collection 
        app.delete('/products/:id',async(req, res)=>{
            const id = req.params.id; 
            const query = {_id:ObjectId(id)}
            const result = await watchCollection.deleteOne(query)
  
            res.json(result)
        })

        // UPDATE API 
        // update user info if not exist in db
        app.put('/users', async(req,res)=>{
            const user= req.body;
            const filter= {email: user.email}
            const options = {upsert: true}
            const updateDoc = {$set:user}
            const result = await userCollection.updateOne(filter, updateDoc,options) 
            res.send(result)
        }) 
        // make admin api 
        app.put('/users/admin',async(req, res)=>{
            const user = req.body
            const filter = {email: user.email}
            const updateDoc={$set:{role:'admin'}}
            const result = await userCollection.updateOne(filter,updateDoc) 
            res.send(result)
        })
        // updata status 
        app.put('/updateOrder/:id',async(req, res)=>{
            const id = req.params.id;
            const filter = {_id:ObjectId(id)}
            const updateDoc= {$set:{status:'shipped'}}
            const result = await orderCollection.updateOne(filter,updateDoc)
            console.log(result)
            res.json(result)
        })
        

    }
    finally{

    }
}
run().catch(console.dir)

app.get('/', (req, res)=>{
    res.send('This is Timeless Server')
})
app.listen(port,()=>{
    console.log('listening to port', port)
})