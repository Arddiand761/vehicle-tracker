import { Request, Response } from 'express';
import {
  getAllDrivers,
  getDriverById,
  getDriverTripHistory,
  createDriver,
  updateDriver,
  deleteDriver,
} from './drivers.queries';
import { CreateDriverBody, UpdateDriverBody } from './drivers.types';

export const getAll = async (req: Request, res: Response) => {
  try {
    const drivers = await getAllDrivers();
    return res.json(drivers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const driver = await getDriverById(req.params.id as string);
    if (!driver) return res.status(404).json({ message: 'Driver tidak ditemukan' });
    return res.json(driver);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTripHistory = async (req: Request, res: Response) => {
  try {
    const driver = await getDriverById(req.params.id as string);
    if (!driver) return res.status(404).json({ message: 'Driver tidak ditemukan' });

    const history = await getDriverTripHistory(req.params.id as string);
    return res.json(history);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { user_id, license_number, phone }: CreateDriverBody = req.body;
    if (!user_id || !license_number || !phone) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }
    const driver = await createDriver({ user_id, license_number, phone });
    return res.status(201).json(driver);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'License number sudah terdaftar' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data: UpdateDriverBody = req.body;
    const driver = await updateDriver(req.params.id as string, data);
    if (!driver) return res.status(404).json({ message: 'Driver tidak ditemukan' });
    return res.json(driver);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const driver = await deleteDriver(req.params.id as string);
    if (!driver) return res.status(404).json({ message: 'Driver tidak ditemukan' });
    return res.json({ message: 'Driver berhasil dihapus' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};