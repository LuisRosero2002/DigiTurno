import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

router.get('/servicios', async (req, res) => {
    try {

        const servicios = await prisma.sERVICIOS.findMany()
        res.status(200).json(servicios);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error en el servidor.' });
    }
});


export default router;
