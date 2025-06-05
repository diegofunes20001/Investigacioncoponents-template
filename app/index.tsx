import { StyleSheet, Text, View } from "react-native";

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Initialize SQLite database
const db = new sqlite3.Database('images.db');

// Create images table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    originalname TEXT NOT NULL,
    mimetype TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// API Routes

// Upload image endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se ha subido ninguna imagen' 
      });
    }

    // Save file info to database
    const stmt = db.prepare(`INSERT INTO images (filename, originalname, mimetype, size, path) 
                            VALUES (?, ?, ?, ?, ?)`);

    stmt.run([
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      req.file.path
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al guardar en la base de datos' 
        });
      }

      res.json({
        success: true,
        message: 'Imagen subida correctamente',
        data: {
          id: this.lastID,
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          url: `http://localhost:${PORT}/uploads/${req.file.filename}`
        }
      });
    });

    stmt.finalize();

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Get all images endpoint
app.get('/api/images', (req, res) => {
  db.all('SELECT * FROM images ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al obtener las imágenes' 
      });
    }

    const images = rows.map(row => ({
      ...row,
      url: `https://${process.env.REPLIT_DEV_DOMAIN}/uploads/${row.filename}`
    }));

    res.json({
      success: true,
      data: images
    });
  });
});

// Get single image endpoint
app.get('/api/images/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM images WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al obtener la imagen' 
      });
    }

    if (!row) {
      return res.status(404).json({ 
        success: false, 
        message: 'Imagen no encontrada' 
      });
    }

    res.json({
      success: true,
      data: {
        ...row,
        url: `https://${process.env.REPLIT_DEV_DOMAIN}/uploads/${row.filename}`
      }
    });
  });
});

// Delete image endpoint
app.delete('/api/images/:id', (req, res) => {
  const { id } = req.params;

  // First get the image info to delete the file
  db.get('SELECT * FROM images WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al obtener la imagen' 
      });
    }

    if (!row) {
      return res.status(404).json({ 
        success: false, 
        message: 'Imagen no encontrada' 
      });
    }

    // Delete file from filesystem
    fs.unlink(row.path, (fsErr) => {
      if (fsErr) {
        console.error('File deletion error:', fsErr);
      }
    });

    // Delete record from database
    db.run('DELETE FROM images WHERE id = ?', [id], function(dbErr) {
      if (dbErr) {
        console.error('Database deletion error:', dbErr);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al eliminar la imagen de la base de datos' 
        });
      }

      res.json({
        success: true,
        message: 'Imagen eliminada correctamente'
      });
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande (máximo 10MB)'
      });
    }
  }

  res.status(500).json({
    success: false,
    message: error.message || 'Error interno del servidor'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  console.log(`📁 Archivos disponibles en http://0.0.0.0:${PORT}/uploads`);
  console.log(`🏥 API de HospitalityHR lista para recibir imágenes`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor...');
  db.close((err) => {
    if (err) {
      console.error('Error cerrando la base de datos:', err);
    } else {
      console.log('✅ Base de datos cerrada correctamente');
    }
    process.exit(0);
  });
});