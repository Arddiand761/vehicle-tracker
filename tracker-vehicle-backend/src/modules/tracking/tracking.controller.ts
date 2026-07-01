import { Request, Response } from 'express';
import {
  getLatestAllVehicles,
  getLatestByVehicle,
} from './tracking.queries';

export const getLiveAll = async (req: Request, res: Response) => {
  try {
    const locations = await getLatestAllVehicles();
    return res.json(locations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLiveByVehicle = async (req: Request, res: Response) => {
  try {
    const location = await getLatestByVehicle(req.params.vehicleId as string);
    if (!location) return res.status(404).json({ message: 'Data lokasi tidak ditemukan' });
    return res.json(location);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};