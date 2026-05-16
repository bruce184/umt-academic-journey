import express from 'express';
const app = express();

// Define the port
// Use environment PORT when available. If the chosen port is in use,
// we'll try the next port (port+1) automatically so the app can start
// without changing other files or requiring the user to manually free the port.
const DEFAULT_PORT = 3300;
let port = process.env.PORT ? Number(process.env.PORT) : DEFAULT_PORT;

// Set up Handlebars view engine 
import {create} from 'express-handlebars';
//Configure Handlebars
const hbs = create({
	extname: '.hbs',
	layoutsDir: 'views/layouts/',
	defaultLayout: 'main',
	// register partials directory so partials like cssHead, jsBS, nav, footer are found
	partialsDir: 'views/partials/'
});
hbs.handlebars.registerHelper('upper', function(options){
	const content = options.fn(this);
	return content.toUpperCase();
});
//Register Handlebars as view engine
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', './views');

//Create __dirname variable 
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets from /public
app.use(express.static(path.join(__dirname, 'public')));

//Import routes 
import rootRouter from './routers/root.r.js';
app.use('/', rootRouter); //Use root routes

// Start server with simple retry-on-EADDRINUSE behavior.
// This keeps the change minimal and avoids touching other files.
function startServer(p) {
	const server = app.listen(p, () => {
		console.log(`Server started at http://localhost:${p}`);
	});

	server.on('error', (err) => {
		if (err && err.code === 'EADDRINUSE') {
			console.warn(`Port ${p} is in use, trying ${p + 1}...`);
			startServer(p + 1);
		} else {
			console.error('Server error:', err);
			process.exit(1);
		}
	});
}

startServer(port);