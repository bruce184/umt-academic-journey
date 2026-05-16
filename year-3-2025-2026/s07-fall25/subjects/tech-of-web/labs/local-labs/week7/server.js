// server.js
import express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import productRouter from './routers/product.r.js';
import categoryRouter from './routers/category.r.js';
import homeRouter from './routers/home.r.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Handlebars with helpers for pagination
app.engine(
    'hbs',
    exphbs.engine({
        extname: '.hbs',
        helpers: {
            // {{#range 1 totalPages}} ... {{/range}}
            range(from, to, options) {
                let result = '';
                let start = Number(from);
                let end = Number(to);
                for (let i = start; i <= end; i++) {
                    result += options.fn(i);
                }
                return result;
            },
            // {{#if (eq a b)}}active{{/if}}
            eq(a, b) {
                return Number(a) === Number(b);
            },
            // {{add a b}}
            add(a, b) {
                return Number(a) + Number(b);
            },
            // {{sub a b}} – phòng khi cần
            sub(a, b) {
                return Number(a) - Number(b);
            }
        }
    })
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve assets (images, json…)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Đường dẫn ảnh sản phẩm (trùng với views/product/*.hbs dùng /imgs/p{{id}}.png)
app.use('/imgs', express.static(path.join(__dirname, 'assets', 'imgs')));

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
