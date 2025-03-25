import { Router } from 'express';
import axios from 'axios';

export class GeocodeRoutes {
  static get routes(): Router {
    const router = Router();

    router.get('', async (req, res) => {
      try {
        const { address } = req.query;
        if (!address || typeof address !== 'string')
          return res.status(400).json({ error: 'Dirección requerida' });

        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address,
        )}&format=json&addressdetails=1&limit=5`;

        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Isra/1.0',
          },
        });

        res.json(response.data);
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener la geolocalización' });
      }
    });
    return router;
  }
}
