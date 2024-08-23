import { Request, Response } from 'express';
import { poolPromise } from '../config/db';
import { EncryptionKey } from '../models/encryptionKey';
import crypto from 'crypto';

const encryptionAlgorithm = 'aes-256-cbc'; // Example: AES-256-CBC encryption algorithm
const encryptionSecret = process.env.ENCRYPTION_SECRET!; 

const encrypt = (key: string) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(encryptionAlgorithm, Buffer.from(encryptionSecret), iv);
    let encrypted = cipher.update(key);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  };
  
  const decrypt = (encryptedKey: string) => {
    const [iv, encrypted] = encryptedKey.split(':');
    const decipher = crypto.createDecipheriv(encryptionAlgorithm, Buffer.from(encryptionSecret), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  };
  
  export const createEncryptionKey = async (req: Request, res: Response) => {
    try {
      const { user_id, plain_text_key } = req.body;
  
      if (!user_id || !plain_text_key) {
        return res.status(400).json({ errorMessage: 'User ID and plain text key are required' });
      }
  
      const encryptedKey = encrypt(plain_text_key);
  
      const pool = await poolPromise;
      const result = await pool.request()
        .input('user_id', user_id)
        .input('encrypted_key', encryptedKey)
        .query(`INSERT INTO EncryptionKeys (user_id, encrypted_key, created_at)
                VALUES (@user_id, @encrypted_key, GETDATE());
                SELECT * FROM EncryptionKeys WHERE key_id = SCOPE_IDENTITY();`);
  
      const encryptionKey: EncryptionKey = result.recordset[0];
      res.status(201).json(encryptionKey);
    } catch (err: any) {
      res.status(500).json({ errorMessage: err.message });
    }
  };
  
  export const getEncryptionKeyByUser = async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
  
      const pool = await poolPromise;
      const result = await pool.request()
        .input('user_id', user_id)
        .query('SELECT * FROM EncryptionKeys WHERE user_id = @user_id');
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ errorMessage: 'Encryption key not found' });
      }
  
      const encryptionKey: EncryptionKey = result.recordset[0];
      encryptionKey.encrypted_key = decrypt(encryptionKey.encrypted_key);
      res.status(200).json(encryptionKey);
    } catch (err: any) {
      res.status(500).json({ errorMessage: err.message });
    }
  };
  
  export const deleteEncryptionKey = async (req: Request, res: Response) => {
    try {
      const { key_id } = req.params;
  
      const pool = await poolPromise;
      const result = await pool.request()
        .input('key_id', key_id)
        .query('DELETE FROM EncryptionKeys WHERE key_id = @key_id');
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ errorMessage: 'Encryption key not found' });
      }
  
      res.status(200).json({ message: 'Encryption key deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ errorMessage: err.message });
    }
  };