const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@sohebcluster.mbyuxfx.mongodb.net/?appName=SohebCluster`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("PlateShare Server Is Running");
});

async function run() {
  try {
    await client.connect();
    const db = client.db("plateShareDB");
    const foodsCollection = db.collection("foods");

    app.get("/foods", async (req, res) => {
      const status = req.query.food_status;

      const query = {};
      if (status) {
        query.status = status;
      }
      const cursor = foodsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/foods", async (req, res) => {
      const email = req.query.donorEmail;

      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = foodsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
    });
    /////////////////////////
    app.get("/featured-foods", async (req, res) => {
      const cursor = foodsCollection.find().sort({ foodQuantity: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/add-food", async (req, res) => {
      const newFood = req.body;
      const result = await foodsCollection.insertOne(newFood);
      res.send(result);
    });

    app.patch("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const updatedFood = req.body;
      console.log(updatedFood);
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          foodName: updatedFood.foodName,
          foodQuantity: updatedFood.foodQuantity,
          pickupLocation: updatedFood.pickupLocation,
          expireDate: updatedFood.expireDate,
          notes: updatedFood.notes,
        },
      };
      const result = await foodsCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`PlateShare running on port ${port}`);
});
