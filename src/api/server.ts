import { connect } from 'mongoose';
import cors from 'cors';
import express from 'express'
import bodyParser from 'body-parser';
import { recordingRouter } from './endpoints/recordings';

const dbRoute = `mongodb://localhost:27017/recordings`;
const API_PORT = 3001;
(async function() {
    await connectMongo();
    
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ limit: '50mb' })); //TODO - Let's think about security...
    app.use(cors())
    app.options('*', cors())
    app.use('/api', recordingRouter);
    app.listen(API_PORT, () => console.log(`Server listening on port ${API_PORT}`))
})()

async function connectMongo() {
    try {
        const mongoose = await connect(dbRoute, { useNewUrlParser: true });
        return mongoose.connection;
    } catch(e) {
        console.log(`Error connecting to Mongo ${e.message}`);
        throw e;
    }
}