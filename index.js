const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
var cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000
const ObjectId = require("mongodb").ObjectId;


app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lp6z6.mongodb.net/traveldestination?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("traveldestination");
        const blogs = database.collection("blogs");
        const users = database.collection("users");
        
        app.get("/allblogs", async (req, res) => {
           
            let result = await blogs.find({}).toArray();
            res.send(result)
           
        })
        
        app.get("/blogs", async (req, res) => {
            const query = { status: "approved" }
            let result = await blogs.find(query).toArray();
            res.send(result)
           
        })

        app.get("/blogs/:rating", async (req, res) => {
            

            const ratings = parseInt(req.params.rating);
            if (ratings == 10) {
                const query = { status: "approved" }
                let result = await blogs.find(query).toArray();
                res.send(result)
            } else {
                const query = { ratings: ratings, status: "approved" }
                let result = await blogs.find(query).toArray();
                res.send(result)
            }
           

        })


        app.post("/addexperience", async (req, res) => {
       
            const query = { title: req.body.title }
            const findblog = await blogs.findOne(query);
          
            if (findblog == null) {
                const result = await blogs.insertOne(req.body);
                res.send(result);
             
            } else {
                res.send(false)
            }
           
        });


        app.put("/updateblog/:id", async (req, res) => {
              
            const myid = req.params.id
            const filter = { _id: ObjectId(myid) };
            const options = { upsert: true };
            const { image, title, expense, traveler, location, category, date, description, rating } = req.body;
            if (image == "" || title == "" || expense == "" || traveler=="" || location=="" || category== "" || date=="" || description=="" || rating=="") {
                  res.send(false)
            } else {
                const updateDoc = {
                    $set: {
                        image: req.body.image,
                        title: req.body.title,
                        expense: req.body.expense,
                        traveler: req.body.traveler,
                        location: req.body.location,
                        category: req.body.category,
                        date: req.body.date,
                        description: req.body.description,
                        ratings: req.body.rating,
                        status: "pending"
                    },
                };
                const result = await blogs.updateOne(filter, updateDoc, options);
                if (result.matchedCount === 1) {
                    res.send("Blog updated successfully");
                }
              }
          });

       app.get("/singleblog/:id", async (req, res) => {
             let id = req.params.id;
             const query={_id:ObjectId(id)}
             let result = await blogs.findOne(query);
             res.send(result)
           
            })

        app.post("/saveuser", async (req, res) => {

            const result = await users.insertOne(req.body);
            console.log(result);
        });

        app.get("/userfind/:email", async (req, res) => {

            const email = req.params.email;
            const filter = { email: email };
            const result = await users.findOne(filter);
            res.send(result)


        });



        app.put("/changestatus/:id", async (req, res) => {

            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "approved"
                },
            };
            const result = await blogs.updateOne(filter, updateDoc, options);
            if (result.matchedCount === 1) {
                res.send("Successfully change blog status.");
            } else {
                res.send("blog status change not success");
            }
        });

        app.delete("/deleteblog/:id", async (req, res) => {

            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await blogs.deleteOne(query);
            if (result.deletedCount === 1) {
                res.send("Blog deleted successfully");
            } else {
                res.send("Blog not deleted");
            }
        });
      app.put("/makeadmin/:email",async(req,res)=>{

      const email=req.params.email;
      const filter = { email: email };
      const result=await users.findOne(filter);
     if(result==null){
        res.send(false);
      }else{
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            role:"admin"
          },
         };
        const result = await users.updateOne(filter, updateDoc, options);
        if (result.matchedCount === 1) {
          res.send("Admin created successfully");
        }
      }
     
     });

    } finally {
        
    }


}

run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`server running listening at http://localhost:${port}`)
})