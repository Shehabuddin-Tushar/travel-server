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
                const query = { ratings: ratings,status:"approved" }
                let result = await blogs.find(query).toArray();
                res.send(result) 
            }
           

        })


         app.post("/addexperience",async (req, res) => {
       
          const query={title:req.body.title}
          const findblog=await blogs.findOne(query);
          
          if(findblog==null){
            const result=await blogs.insertOne(req.body);
            res.send(result);
             
          }else{
            res.send(false)
          }
           
           });

         app.get("/singleblog/:id", async (req, res) => {
             let id = req.params.id;
             const query={_id:ObjectId(id)}
             let result = await blogs.findOne(query);
             res.send(result)
           
            })


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