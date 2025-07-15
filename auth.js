// middlewares/auth.js
const { admin } = require('./config/firebase.config.js');

async function isAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;

        req.user.userId = decodedToken.uid;
        next(); // ✅ Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = { isAuthenticated };
