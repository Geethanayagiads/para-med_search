const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for specified frontend origins
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5173'], // Ensure this matches your frontend origin
    methods: ['GET', 'POST', 'OPTIONS'], // Allow GET, POST, and OPTIONS
    allowedHeaders: ['Content-Type'] // Specify the allowed headers
}));

// Serve static HTML files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Check if MONGO_URI is set
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in .env file');
    process.exit(1);
}

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Define a Mongoose schema for the registration form
const RegistrationSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    specialization: { type: String, required: true },
    title: {type: String, required: true},
    license_number: {type: String, required: true},
    license_expiry: {type: String, required: true},
    degree: {type: String, required: true},
    skills: {type: String, required: true},
    availability: {type: String, required: true},
    working_hours: {type: String, required: true},
    languages: {type: String, required: true}
});

// Create the Mongoose model
const Registration = mongoose.model('Registration', RegistrationSchema);

// API route to handle form submission (Offer Service - Registration)
app.post('/api/submit-registration', async (req, res) => {
    try {
        console.log('Received registration data:', req.body); // Log the data
        const registration = new Registration(req.body);
        await registration.save();
        // Redirect to success page after saving the data
        res.sendFile(path.join(__dirname, 'success.html'));
    } catch (error) {
        console.error('Error saving registration:', error.message); // Log the error
        res.status(400).json({ error: 'Error saving registration: ' + error.message });
    }
});

// API route to handle search for paramedical professionals (Get Service)
app.post('/api/search-paramedical', async (req, res) => {
    const { city, specialization } = req.body;

    try {
        // Find professionals in the database based on the search criteria
        const results = await Registration.find({
            city: new RegExp(city, 'i'), // Case-insensitive search for city
            specialization: new RegExp(specialization, 'i') // Case-insensitive search for specialization
        });

        // Send matching professionals back to the frontend
        res.json(results);
    } catch (error) {
        console.error('Error fetching search results:', error.message);
        res.status(500).json({ error: 'Error fetching search results' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
