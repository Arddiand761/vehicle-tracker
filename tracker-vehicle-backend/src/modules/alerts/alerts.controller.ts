import { Request, Response } from 'express';
import {
  getAllAlerts,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from './alerts.queries';
import { AlertFilter } from './alerts.types';

export const getAll = async (req: Request, res: Response) => {
  try {
    const filter: AlertFilter = {
      vehicle_id: req.query.vehicle_id as string,
      type: req.query.type as any,
      is_read: req.query.is_read !== undefined
        ? req.query.is_read === 'true'
        : undefined,
    };
    const alerts = await getAllAlerts(filter);
    return res.json(alerts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const readOne = async (req: Request, res: Response) => {
  try {
    const alert = await markAsRead(req.params.id as string);
    if (!alert) return res.status(404).json({ message: 'Alert tidak ditemukan' });
    return res.json(alert);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const readAll = async (req: Request, res: Response) => {
  try {
    await markAllAsRead();
    return res.json({ message: 'Semua alert telah ditandai sudah dibaca' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const unreadCount = async (req: Request, res: Response) => {
  try {
    const count = await getUnreadCount();
    return res.json({ count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};