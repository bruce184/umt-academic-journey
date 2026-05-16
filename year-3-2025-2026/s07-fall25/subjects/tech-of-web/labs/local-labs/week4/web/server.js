import express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import productRouter from './routers/product.r.js';
import categoryRouter from './routers/category.r.js';
import homeRouter from './routers/home.r.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve assets (css, images, etc.)
app.use('/assets', express.static(path.join(__dirname, 'assets')));
// Also serve product images from the other project (imgs)
app.use('/imgs', express.static(path.join(__dirname, '..', '2302700353', 'assets', 'imgs')));

// Mount routers
// use home router for root path
app.use('/', homeRouter);
// product and category routes
app.use('/products', productRouter);
app.use('/categories', categoryRouter);
// also mount home router at /home if needed
app.use('/home', homeRouter);

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

