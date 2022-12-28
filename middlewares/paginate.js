const Post = require('../models/post');
const User = require('../models/user');


// comment le passer à mon controller function getAllPosts + Include Users in find method
// PAGINATE 
function paginatedResults(model) {
    return (req, res, next) => {
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)

        if (!Number.isFinite(limit) || limit <= 0 || limit > 50) {
            //return res.badRequest('Please try again with limit between 1 and 50 !')
            return res.status(400).json({ error: 'Client input error' });
        }

        if (!Number.isFinite(page) || page <= 0) {
            //return res.badRequest('Please try again with valid page number')
            return res.status(400).json({ error: 'Client input error' });
        }

        model.findAndCountAll({
            //include: [{ model: User, required: true, attributes: ['id', 'firstname', 'lastname', 'isActive'] }],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: ((page - 1) * limit)
        })
            .then((data) => {
                if (data.rows && data.rows.length > 0) {
                    const totalPages = Math.ceil(data.count / limit)
                    return res.status(200).json({
                        totalCount: data.count,
                        itemsCount: data.rows.length,
                        totalPages,
                        nextPage: page < totalPages ? page + 1 : null,
                        previousPage: page > 1 ? page - 1 : null,
                        items: data.rows,
                    })
                } else {
                    return res.status(400).json({ error: 'Client input error' });
                }
            })
            .catch(() => res.status(500).json({ error: 'Internal server error' }));
        next(); // depending if used as "middleware"
    }
}

module.exports = { paginatedResults };