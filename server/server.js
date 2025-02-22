const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
app.use(express.json());

app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:8080"], // Autoriser plusieurs origines
  credentials: true
}));
// 🔹 Route d'enregistrement (Register)
app.post("/api/register", async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  // Vérification des champs requis
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ success: false, message: "Tous les champs sont requis" });
  }

  // Vérifier si l'utilisateur existe déjà
  const sqlCheckUser = "SELECT * FROM users WHERE email = ?";
  db.query(sqlCheckUser, [email], async (err, results) => {
    if (err) {
      console.error("❌ Erreur lors de la vérification de l'utilisateur :", err);
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: "Cet utilisateur existe déjà" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur dans la base de données
    const sqlInsertUser = "INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)";
    db.query(sqlInsertUser, [email, hashedPassword, firstName, lastName, role], (err, result) => {
      if (err) {
        console.error("❌ Erreur lors de l'insertion de l'utilisateur :", err);
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }

      res.status(201).json({ success: true, message: "Utilisateur créé avec succès" });
    });
  });
});

// Session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 3600000 } // 1h
}));

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'visionsoil',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// 🔹 Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });
    if (results.length === 0) return res.status(400).json({ success: false, message: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid password" });

    // Store user data in session
    req.session.user = { id: user.id, name: user.first_name, email: user.email, role: user.role };

    res.json({ success: true, user: req.session.user });
  });
});

// 🔹 Session check route
app.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token"); // Suppression du cookie JWT ou session
  res.json({ success: true, message: "Déconnecté avec succès" });
});
// 🔹 Récupération de la liste des utilisateurs
app.get('/api/users', (req, res) => {
  const query = 'SELECT id, first_name, last_name, email, role FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
    res.status(200).json(results);
  });
});

// 🔹 Suppression d'un utilisateur
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erreur suppression:', err);
      return res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  });
});

// 🔹 Mise à jour d'un utilisateur
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, role } = req.body;

  if (!id || isNaN(id) || !first_name || !last_name || !email || !role) {
    return res.status(400).json({ message: 'Champs invalides' });
  }

  const query = `UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ? WHERE id = ?`;
  db.query(query, [first_name, last_name, email, role, id], (err, result) => {
    if (err) {
      console.error('Erreur mise à jour:', err);
      return res.status(500).json({ message: 'Erreur interne' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: 'Utilisateur mis à jour avec succès' });
  });
});


// Start the server
const port = 8081;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
