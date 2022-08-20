const config = require('./libs/config-loader');
const { MongoClient } = require("mongodb");

const uri = config.get('connectionString')

const client = new MongoClient(uri);

async function run() {
    try {
        const database = client.db('tasks');
        const movies = database.collection('movies');

        await movies.insertOne({title : 'Back to the Future'});
        // Query for a movie that has the title 'Back to the Future'
        const query = { title: 'Back to the Future' };
        const movie = await movies.findOne(query);
        console.log(movie);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);