import { Request, Response } from 'express';
import {
  getAllTrips,
  getTripById,
  getTripReport,
  startTrip,
  endTrip,
} from './trips.queries';
import { CreateTripBody, EndTripBody, TripFilter } from './trips.types';

export const getAll = async (req: Request, res: Response) => {
  try {
    const filter: TripFilter = {
      vehicle_id: req.query.vehicle_id as string,
      driver_id: req.query.driver_id as string,
      status: req.query.status as any,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
    };
    const trips = await getAllTrips(filter);
    return res.json(trips);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const trip = await getTripById(req.params.id as string);
    if (!trip) return res.status(404).json({ message: 'Trip tidak ditemukan' });
    return res.json(trip);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to } = req.query;
    if (!date_from || !date_to) {
      return res.status(400).json({ message: 'date_from dan date_to wajib diisi' });
    }
    const report = await getTripReport(date_from as string, date_to as string);
    return res.json(report);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const start = async (req: Request, res: Response) => {
  try {
    const { vehicle_id, driver_id }: CreateTripBody = req.body;
    if (!vehicle_id || !driver_id) {
      return res.status(400).json({ message: 'vehicle_id dan driver_id wajib diisi' });
    }
    const trip = await startTrip({ vehicle_id, driver_id });
    return res.status(201).json(trip);
  } catch (err: any) {
    if (err.message === 'VEHICLE_NOT_FOUND') return res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    if (err.message === 'VEHICLE_ON_TRIP') return res.status(409).json({ message: 'Kendaraan sedang dalam perjalanan' });
    if (err.message === 'DRIVER_NOT_FOUND') return res.status(404).json({ message: 'Driver tidak ditemukan' });
    if (err.message === 'DRIVER_ON_TRIP') return res.status(409).json({ message: 'Driver sedang dalam perjalanan' });
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const end = async (req: Request, res: Response) => {
  try {
    const { distance_km }: EndTripBody = req.body;
    if (distance_km === undefined) {
      return res.status(400).json({ message: 'distance_km wajib diisi' });
    }
    const trip = await endTrip(req.params.id as string, distance_km);
    return res.json(trip);
  } catch (err: any) {
    if (err.message === 'TRIP_NOT_FOUND') return res.status(404).json({ message: 'Trip tidak ditemukan' });
    if (err.message === 'TRIP_NOT_ONGOING') return res.status(409).json({ message: 'Trip sudah selesai atau dibatalkan' });
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};