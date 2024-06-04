import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

router.post('/login', async (req, res) => {
    try {
        const dataUser = req.body;
        const user = await prisma.CLIENTES.create({
            data: dataUser
        });
        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error en el servidor.' });
    }
});

router.get('/login/:id', async (req, res) => {
    try {
        const cedula_user =  parseInt(req.params.id);
        const user = await prisma.cLIENTES.findFirst({
            where:{
                CEDULA: cedula_user
            }
        })
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error en el servidor.' });
    }
});

export default router;