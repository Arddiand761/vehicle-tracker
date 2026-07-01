import { Request, Response } from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  assignDriver,
  unassignDriver,
} from './vehicles.queries';
import { CreateVehicleBody, UpdateVehicleBody, AssignDriverBody } from './vehicles.types';

export const getAll = async (req: Request, res: Response) => {
  try {
    const vehicles = await getAllVehicles();
    return res.json(vehicles);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const vehicle = await getVehicleById(req.params.id as string);
    if (!vehicle) return res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    return res.json(vehicle);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { plate_number, brand, model, type }: CreateVehicleBody = req.body;
    if (!plate_number || !brand || !model || !type) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }
    const vehicle = await createVehicle({ plate_number, brand, model, type });
    return res.status(201).json(vehicle);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Plat nomor sudah terdaftar' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data: UpdateVehicleBody = req.body;
    const vehicle = await updateVehicle(req.params.id as string, data);
    if (!vehicle) return res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    return res.json(vehicle);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const vehicle = await deleteVehicle(req.params.id as string);
    if (!vehicle) return res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    return res.json({ message: 'Kendaraan berhasil dihapus' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const assign = async (req: Request, res: Response) => {
  try {
    const { driver_id }: AssignDriverBody = req.body;
    if (!driver_id) return res.status(400).json({ message: 'driver_id wajib diisi' });
    const vehicle = await assignDriver(req.params.id as string, driver_id);
    if (!vehicle) return res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    return res.json({ message: 'Driver berhasil di-assign', vehicle });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const unassign = async (req: Request, res: Response) => {
  try {
    const vehicle = await unassignDriver(req.params.id as string);
    if (!vehicle) return res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    return res.json({ message: 'Driver berhasil di-unassign', vehicle });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};