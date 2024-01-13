const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middlewere
app.use(express.json());
app.use(cors());

const uri =
  "mongodb+srv://admin:admin@cluster0.0e8wm8t.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const database = client.db("Ticket-selling-app").collection("busList");
  const busCollection = client
    .db("Ticket-selling-app")
    .collection("availableBus");
  const bookingCollection = client
    .db("Ticket-selling-app")
    .collection("bookedSit");
  const userCollection = client.db("Ticket-selling-app").collection("users");
  const reviewCollection = client.db("Ticket-selling-app").collection("review");
  try {
    app.get("/busList", async (req, res) => {
      const query = {};
      const busList = await database.find(query).toArray();
      res.send(busList);
    });

    app.get("/bookings", async (req, res) => {
      const query = {};
      const busList = await bookingCollection.find(query).toArray();
      res.send(busList);
    });

    app.get("/singlebookings", async (req, res) => {
      const id = req.query.id;

      const query = { guestid: id };
      const result = await bookingCollection.find(query).toArray();

      res.send(result);
    });

    app.get("/availableBus", async (req, res) => {
      const busCategory = req.query.category;
      const query = { category: busCategory };
      const busList = await busCollection.findOne(query);
      res.send(busList);
    });

    app.post("/booked", async (req, res) => {
      const bookingDetails = req.body;
      const result = await bookingCollection.insertOne(bookingDetails);

      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const query = {};
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const reviewDetails = req.body;
      const { message, starRating, busName, reviewer } = reviewDetails;
      const query = {
        bus: busName,
      };
      const existingBus = await reviewCollection.findOne(query);

      if (existingBus) {
        const updatedReviewerList = [...existingBus.reviewerList, reviewer];
        const updatedMessages = [...existingBus.messageList, message];

        let totalRating = existingBus.rating + starRating;
        let newRating = (totalRating / updatedMessages.length).toFixed(2);

        const options = { upsert: true };
        const filter = { bus: busName };
        const updateDoc = {
          $set: {
            reviewerList: updatedReviewerList,
            messageList: updatedMessages,
            rating: newRating,
          },
        };
        const result = await reviewCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
        return;
      }
      const review = {
        rating: starRating,
        bus: busName,
        messageList: [message],
        reviewerList: [reviewer],
      };
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const findEmail = req.query.email;
      console.log(findEmail);
      const query = { email: findEmail };
      const result = await userCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userDetails = req.body;

      const findEmail = req.body.email;

      const query = { email: findEmail };
      const existingUsers = await userCollection.findOne(query);

      if (existingUsers) {
        res.send({ message: "same data", insertedId: existingUsers._id });
        return;
      }
      const result = await userCollection.insertOne(userDetails);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {});
