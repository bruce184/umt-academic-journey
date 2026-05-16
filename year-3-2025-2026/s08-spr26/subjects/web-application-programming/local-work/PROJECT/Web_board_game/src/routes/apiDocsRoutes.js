const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { requireApiKey } = require('../middleware/apiKeyMiddleware');
const { renderApiDocsHtml } = require('../docs/openapi');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));
router.use(requireApiKey);

router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderApiDocsHtml());
});

module.exports = router;
