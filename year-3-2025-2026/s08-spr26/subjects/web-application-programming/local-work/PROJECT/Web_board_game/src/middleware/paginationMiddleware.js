const getPaginationParams = (req, res, next) => {
    let { page, pageSize } = req.query;
    
    page = parseInt(page, 10) || 1;
    if (page < 1) page = 1;
    
    pageSize = parseInt(pageSize, 10) || 10;
    if (pageSize < 1) pageSize = 1;
    if (pageSize > 100) pageSize = 100; // Cap
    
    req.pagination = { page, pageSize };
    next();
};

module.exports = {
    getPaginationParams
};
