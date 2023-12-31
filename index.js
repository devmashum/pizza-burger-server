const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.oqyepgg.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();
        const newItemsCollection = client.db('Pizza-Burger').collection('newItems');
        const allFoodsCollection = client.db('Pizza-Burger').collection('allFoods');
        const myCartCollection = client.db('Pizza-Burger').collection('mycart');
        const itemListCollection = client.db('Pizza-Burger').collection('itemlist');
        const cardCollection = client.db('Pizza-Burger').collection('card');

        // Create newItems 
        app.post('/additems', async (req, res) => {
            const newItems = req.body;
            console.log(newItems);
            const result = await newItemsCollection.insertOne(newItems);
            res.send(result);
        })
        // Get newItems from the DataBase

        app.get('/additems', async (req, res) => {
            const cursor = newItemsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // Get Card collection to show in home page
        app.get('/card', async (req, res) => {
            const cursor = cardCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        // Add the product to mycart Database
        app.post('/mycart', async (req, res) => {
            const newFood = req.body;
            console.log(newFood);
            const result = await myCartCollection.insertOne(newFood);
            res.send(result);
        })
        // Get the mycart data from the database:

        app.get('/mycart', async (req, res) => {
            const cursor = myCartCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Delete items from mycart:
        app.delete('/mycart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await myCartCollection.deleteOne(query);
            res.send(result);
        })


        // Get all Foods data from DataBase
        app.get('/allfoods', async (req, res) => {
            console.log(req.query);

            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const cursor = allFoodsCollection.find()
                .skip(page * size)
                .limit(size)

            const result = await cursor.toArray();
            res.send(result);
        });

        // Show single item from foods data base:
        app.get('/allfoods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allFoodsCollection.findOne(query);
            res.send(result);
        })

        // Delete newItems from myAddedItems

        app.delete('/additems/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await newItemsCollection.deleteOne(query);
            res.send(result);
        })

        // Update added Items step 1: 
        app.get('/additems/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await newItemsCollection.findOne(query);
            res.send(result);
        })

        // Update added Items step: 2

        app.put('/additems/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedItems = req.body;
            const newItems = {
                $set: {
                    foodname: updatedItems.foodname,
                    email: updatedItems.email,
                    category: updatedItems.category,
                    price: updatedItems.price,
                    quantity: updatedItems.quantity,
                    image: updatedItems.image,
                    origin: updatedItems.origin,
                    description: updatedItems.description
                }
            }
            const result = await newItemsCollection.updateOne(filter, newItems, options);
            res.send(result);
        })
        // add the item list from Purchase Page
        app.post('/itemlist', async (req, res) => {
            const newItems = req.body;
            console.log(newItems);
            const result = await itemListCollection.insertOne(newItems);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server is running on port: ${port}`)
})
