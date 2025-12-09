const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voyagehub', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Journal Entry Schema
const JournalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    location: { type: String },
    date: { type: Date, default: Date.now },
    images: [{ type: String }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Journal = mongoose.model('Journal', JournalSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Routes
// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Create token
        const token = jwt.sign({ userId: user._id, username: user.username }, 
                               process.env.JWT_SECRET || 'your-secret-key', 
                               { expiresIn: '7d' });
        
        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user journals
app.get('/api/journals', authenticateToken, async (req, res) => {
    try {
        const journals = await Journal.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });
        res.json(journals);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create journal
app.post('/api/journals', authenticateToken, async (req, res) => {
    try {
        const { title, content, location, images } = req.body;
        
        const journal = new Journal({
            title,
            content,
            location,
            images: images || [],
            userId: req.user.userId
        });
        
        await journal.save();
        res.status(201).json(journal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update journal
app.put('/api/journals/:id', authenticateToken, async (req, res) => {
    try {
        const journal = await Journal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            req.body,
            { new: true }
        );
        
        if (!journal) {
            return res.status(404).json({ message: 'Journal not found' });
        }
        
        res.json(journal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete journal
app.delete('/api/journals/:id', authenticateToken, async (req, res) => {
    try {
        const journal = await Journal.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });
        
        if (!journal) {
            return res.status(404).json({ message: 'Journal not found' });
        }
        
        res.json({ message: 'Journal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
