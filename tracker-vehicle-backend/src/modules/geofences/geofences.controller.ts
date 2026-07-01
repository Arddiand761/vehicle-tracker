import { Request, Response } from 'express';
import {
  getAllGeofences,
  getGeofenceById,
  createGeofence,
  updateGeofence,
  deleteGeofence,
} from './geofences.queries';
import { CreateGeofenceBody, UpdateGeofenceBody } from './geofences.types';

export const getAll = async (req: Request, res: Response) => {
  try {
    const geofences = await getAllGeofences();
    return res.json(geofences);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const geofence = await getGeofenceById(req.params.id as string);
    if (!geofence) return res.status(404).json({ message: 'Geofence tidak ditemukan' });
    return res.json(geofence);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name, polygon_coords }: CreateGeofenceBody = req.body;
    if (!name || !polygon_coords || polygon_coords.length < 3) {
      return res.status(400).json({ message: 'name dan minimal 3 titik polygon wajib diisi' });
    }
    const geofence = await createGeofence({ name, polygon_coords });
    return res.status(201).json(geofence);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data: UpdateGeofenceBody = req.body;
    const geofence = await updateGeofence(req.params.id as string, data);
    if (!geofence) return res.status(404).json({ message: 'Geofence tidak ditemukan' });
    return res.json(geofence);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const geofence = await deleteGeofence(req.params.id as string);
    if (!geofence) return res.status(404).json({ message: 'Geofence tidak ditemukan' });
    return res.json({ message: 'Geofence berhasil dihapus' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};