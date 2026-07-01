import { Request, Response } from 'express';
import { getSummary, getFleetStats, getRecentAlerts } from './dashboard.queries';

export const summary = async (req: Request, res: Response) => {
  try {
    const data = await getSummary();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const fleetStats = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    if (days < 1 || days > 90) {
      return res.status(400).json({ message: 'days harus antara 1-90' });
    }
    const data = await getFleetStats(days);
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const recentAlerts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await getRecentAlerts(limit);
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};