import express from 'express';
import { create } from 'express-handlebars';
import courseRoutes from './routers/courseRoutes.js';

const app = express();
const port = 3000;

const hbs = create({
  extname: '.hbs',
  layoutsDir: './views/layouts',
  partialsDir: './views/partials',
  defaultLayout: 'main',
  helpers: {
    eq: (a, b) => String(a) === String(b),
    add: (a, b) => Number(a) + Number(b),
    subtract: (a, b) => Number(a) - Number(b),
  },
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => res.redirect('/courses'));
app.use('/courses', courseRoutes);

// 404
app.use((req, res) => res.status(404).render('errors/404'));

// 500
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('errors/500', { message: err.message });
});

app.listen(port, () => console.log(`Server running: http://localhost:${port}`));
