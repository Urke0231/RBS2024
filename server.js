const express = require('express');
const bodyParser = require('body-parser');
const db = require('./sql-connector.js'); 
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 3000;
const { exec } = require('child_process');
const crypto = require('crypto');

app.use(bodyParser.json());

app.use(express.static(__dirname)); 

app.post('/unsafe-login', async (req, res) => {
  const { username, password } = req.body;

  const unsafeQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  try {
    const rows = await db.query(unsafeQuery);
    if (rows.length > 0) {
       res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error executing query:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
app.post('/safe-login', async (req, res) => {
  const { username, password } = req.body;

  const safeQuery = `SELECT * FROM users WHERE username = ? AND password = ?`;

  try {
    const rows = await db.query(safeQuery, [username, password]);
    if (rows.length > 0) {
       res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error executing query:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



const fs = require('fs');
MAX_TEXT_LENGTH=8
app.post('/unsafe-buffer', (req, res) => {
  const { bufferData } = req.body; // Extract bufferData from the request body

  // Check if bufferData is provided
  if (!bufferData) {
    return res.status(400).json({
      success: false,
      message: "No data received in the request"
    });
  }

  // Check if the bufferData length exceeds the predefined limit (Buffer Overflow check)
  if (bufferData.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({
      success: false,
      message: "Data exceeds allowed length (Buffer Overflow attempt)"
    });
  }

  // Convert the bufferData to a buffer object with 'utf-8' encoding
  let buffer;
  try {
    buffer = Buffer.from(bufferData, 'utf-8');
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error processing the input data"
    });
  }

  // Process the buffer and return success
  console.log(`Processed buffer of length: ${buffer.length}`);

  // Send a success response
  res.json({
    success: true,
    message: `Data processed successfully! Buffer length: ${buffer.length}`
  });
});

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

app.get('/uploads/:file', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.file);

  // Ensure the file exists and is a PHP file
  if (path.extname(filePath) !== '.php' || !fs.existsSync(filePath)) {
    return res.status(400).send('Invalid PHP file or file does not exist');
  }
  console.log(`php ${filePath} ${req.url}`)
  // Execute the PHP file using PHP interpreter
  exec(`php ${filePath} ${req.url}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error executing PHP: ${stderr}`);
      return res.status(500).send('Error executing PHP script');
    }
    res.send(stdout);  // Return the output of the executed PHP script
  });
});

function sanitizeInput(input) {
  // Remove unwanted characters, like special symbols or escape sequences
  return input.replace(/[^a-zA-Z0-9.-_]/g, '');
}

// Function to validate file type
function isValidFileType(file) {
  // Define allowed mime types (for example, images and PDF)
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
  return allowedTypes.includes(file.mimetype);
}

// Function to sanitize and upload file securely
function safeUpload(req, res, next) {
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  // Sanitize the file name
  const sanitizedFileName = sanitizeInput(file.originalname);

  // Check for file type validation
  if (!isValidFileType(file)) {
    return res.status(400).send('Invalid file type. Only images and PDFs are allowed.');
  }

  // Ensure file size limit (e.g., 5MB)
  if (file.size > 5 * 1024 * 1024) { // 5MB
    return res.status(400).send('File size exceeds the 5MB limit.');
  }

  // Generate a unique file name to prevent overwriting
  const uniqueFileName = crypto.randomBytes(16).toString('hex') + path.extname(sanitizedFileName);
  const filePath = path.join(uploadDir, uniqueFileName);

  // Move the file to the secure directory with a new unique name
  fs.rename(file.path, filePath, (err) => {
    if (err) {
      return res.status(500).send('Error uploading file.');
    }

    // Store the file path for future reference
    req.file.path = filePath;
    req.file.name = uniqueFileName;

    // Proceed to the next middleware (if any)
    next();
  });
}

// Multer middleware for handling file uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit to 50MB
  fileFilter: (req, file, cb) => {
    cb(null, true); // Allow all file types for the exploit
  }
});

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  res.send(`File uploaded successfully: ${req.file.filename}`);
});

app.post('/safe-upload', upload.single('file'), safeUpload, (req, res) => {
  res.send(`File uploaded successfully: ${req.file.name}`);
});

(async () => {
  try {
    await db.initialize();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
})();
