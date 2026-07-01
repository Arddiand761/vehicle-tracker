import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterBody, LoginBody, JwtPayload } from "./auth.types";
import { findUserByEmail, createUser, getUsersNotDriver } from './auth.queries';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role }: RegisterBody = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, password wajib diisi" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, passwordHash, role);

    return res.status(201).json({ message: "Register berhasil", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginBody = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email dan password wajib diisi" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign(payload, secret, {
      expiresIn: "7d",
    } as jwt.SignOptions);

    return res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }

  
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getUsersNotDriver();
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};