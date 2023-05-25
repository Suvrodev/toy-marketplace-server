const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const we = require('./Data/We.json');
require('dotenv').config()


const app=express()
const port=process.env.PORT || 7000;


///middleware
//app.use(cors())
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
app.use(cors(corsConfig))

app.use(express.json());


app.get('/',(req,res)=>{
    res.send(`Toy Market Place server is running port on ${port}`)
})

app.get('/we', (req,res)=>{
    console.log('We All');
    res.send(we)
})

app.get('/we/:id',(req,res)=>{
    const id=req.params.id;
    console.log(id);
    const target_id=we.find(w=>w.id==id)
    res.send(target_id)
})

//MongoDB Start


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jokwhaf.mongodb.net/?retryWrites=true&w=majority`;

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

    //Operation start
    const toyCollection=client.db('toyHouse').collection('Toy')

     ///Write Data start
     app.post('/addtoy', async(req,res)=>{
        const toy=req.body;
        console.log(toy);

        const result= await toyCollection.insertOne(toy)
        res.send(result)
    })
    ///Write Data end

    ///get total Product start
    app.get('/totaltoys', async(req,res)=>{
        const result=await toyCollection.estimatedDocumentCount();
        res.send({totalToys: result})
    })
    ///get total Product end

    ///get All Data start
    app.get('/alltoys', async(req,res)=>{
        console.log('All Toys');
        console.log(req.query);
        const page=parseInt(req.query.page) || 0;
        const limit=parseInt(req.query.limit) || 20;
        const skip=page*limit;
        const result= await toyCollection.find().skip(skip).limit(limit).toArray();
        res.send(result);
    })
    ///get All Data end

    ///get search Data start
    app.get('/searchtoy', async(req,res)=>{
        console.log('Search');
        const searching=req?.query?.toyName;
        console.log(searching);
        let query={}
        if(req?.query?.toyName){
            query={toyName: req?.query?.toyName}
        }
       const result= await toyCollection.find(query).toArray();
       res.send(result);
    })
    ///get search Data end

    ////Get toy according to category start
    app.get('/category', async(req,res)=>{
        console.log('Category');
        const subcategory=req?.query?.subcategory;
        console.log(subcategory);
        let query={}
        if(req?.query?.subcategory){
            query={subcategory: req?.query?.subcategory }
        }
        const result=await toyCollection.find(query).toArray()

        res.send(result)
    })
    ////Get toy according to category end


    //get single Data start
    app.get('/alltoys/:id', async(req,res)=>{
        const id=req.params.id;
        console.log(id);
        const query={_id: new ObjectId(id) }
        const result= await toyCollection.findOne(query)
        res.send(result);
    })
    //get single Data end


    //Get user toys start
    app.get('/mytoys', async(req,res)=>{
        console.log('Email:',req.query.ref_mail);
        const sorting=req.query.srt;
       
         let query={}
         if(req.query?.ref_mail){
             query={ref_mail: req.query.ref_mail}
         }


        console.log('Sorting: ',sorting);
        // if(sorting===true){
        //     console.log('Heating Condition');
        //     const options = {
        //         // sort returned documents in ascending order by title (A->Z)
        //          sort: { price: 1 },
        //       };
   
        //     const result=await toyCollection.find(query,options).toArray();
        //     res.send(result);
        // }
        // else{
        //     console.log('In Else');
        //     const result=await toyCollection.find(query).toArray();
        //     res.send(result);
        // }

        let newResult;
        if(sorting){
            console.log('Heating');
            newResult= await toyCollection.find(query).sort({price: sorting}).toArray();
        }else{
           newResult= await toyCollection.find(query).toArray();
        }
        res.send(newResult)

       
        
     })
    //Get user toys end
    ///////////////////////
    //////////////////////

    ////Delete Toy start
    app.delete('/mytoys/:id', async(req,res)=>{
        console.log('Hitting delete');
        const id=req.params.id;
        const query = {_id: new ObjectId(id)  };
        const result = await toyCollection.deleteOne(query);
        res.send(result)

    })
    ////Delete Toy end


    ///Update toy start
    app.put('/mytoys/:id', async(req,res)=>{
        console.log('Heating Update');
        const id=req.params.id;
        const updatedToy=req.body;
        console.log('PUT');
        console.log(id,updatedToy);

        const filter={_id: new ObjectId(id)}
        const options={upsert: true}

        const newUpdatedToy={
            $set:{
               
                toyName: updatedToy.toyName,
                toyPhoto: updatedToy.toyPhoto,
                seller_name: updatedToy.seller_name,
                seller_email: updatedToy.seller_email,
                subcategory: updatedToy.subcategory ,
                price: updatedToy.price,
                ratting: updatedToy.ratting ,
                available_quantity: updatedToy.available_quantity,
                details: updatedToy.details,
                ref_mail: updatedToy.ref_mail
            }
        }

        const result= await toyCollection.updateOne(filter,newUpdatedToy,options)
        res.send(result)
    })
    ///Update toy end


    //Operation end



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  //  await client.close();
  }
}
run().catch(console.dir);

//MongoDB End



app.listen(port,()=>{
    console.log(`Toy Market Place server is running port on ${port}`);
})