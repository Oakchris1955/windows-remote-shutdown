import express from 'express';
import "dotenv/config";
import { handler } from './utils';

if (typeof process.env.port === "undefined") {
	throw new Error("PORT is missing in the .env file");
}

const port = +process.env.port;
if (isNaN(port)) {
	throw new Error('PORT must be a valid number');
}

const app = express();

app.use(express.urlencoded({extended: true}));

app.post('/shutdown', handler);
app.post('/reboot', handler);

app.listen(port, () => {
	console.log(`Listening for requests on port: ${port}`)
})
