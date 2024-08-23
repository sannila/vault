import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import userRoutes from "./routes/userRoutes";
import vaultRoutes from './routes/vaultRoutes';
import "./config/passport";
import folderRoutes from "./routes/folderRoutes";
import entryRoutes from "./routes/entryRoutes";
import accessControlRoutes from "./routes/accessControlRoutes";
import auditLogRoutes from './routes/auditLogRoutes';
import encryptionKeyRoutes from "./routes/encryptionKeyRoutes";
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// User routes
app.use("/api/users", userRoutes);

// vault routes
app.use('/api/vaults', vaultRoutes);

// folder routes
app.use('/api/folders', folderRoutes);

// Entry routes
app.use('/api/entries', entryRoutes);

// Access Control routes
app.use('/api/access', accessControlRoutes);

// Audit Log routes
app.use('/api/audit-logs', auditLogRoutes);

// Encryption Key routes
app.use('/api/encryption-keys', encryptionKeyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
