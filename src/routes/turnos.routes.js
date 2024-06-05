import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router();

router.post('/turno', async (req, res) => {
    try {

        const data = req.body

        // Trae los empleados que puedan brindar el servico escogido 
        const empleados = await prisma.EMPLEADOS_SERVICIOS.findMany({
            where: {
                ID_SERVICIO: data.ID_SERVICIO
            },
            include: {
                EMPLEADO: true
            }
        });

        // let empleadosLibre = []

        // Filtra los empleados que estan libres para dar el servicio 
        // const procesarEmpleados = async () => {

        //     for (const empleado of empleados) {
        //         console.log(empleado.ID_EMPLEADO);

        //         const empleadoLibre = await prisma.tURNOS.findFirst({
        //             where: {
        //                 ID_EMPLEADO: empleado.ID_EMPLEADO,
        //                 ID_ESTADO: { in: [1, 2] } 
        //             }
        //         });

        //         empleadosLibre.push(empleadoLibre);
        //     }
        //     return empleadosLibre;
        // };

        // const empleados_filtrados = await procesarEmpleados()

        // const empleadoSeleccionado = empleados_filtrados[Math.random() * (empleadosLibre.length - 1)]

        const empleadoSeleccionado = empleados[Math.random() * (empleados.length - 1)]

        const turnos_filtrados = await prisma.tURNOS.findMany({
            where: {
                ID_SERVICIO: data.ID_SERVICIO
            },
            orderBy: {
                FECHA: 'asc'
            }
        })

        let lugar_final = ''
        const info = [
            { "id": 1, "letra": 'A' },
            { "id": 2, "letra": 'B' },
            { "id": 3, "letra": 'C' },
            { "id": 4, "letra": 'D' },
            { "id": 5, "letra": 'E' },
        ]

        if (turnos_filtrados.length > 0) {
            const lugar_string = turnos_filtrados[turnos_filtrados.length - 1].LUGAR
            const letra = lugar_string.match(/[A-Za-z]+/)[0];
            const numero = parseInt(lugar_string.match(/\d+/)[0]) + 1;
            lugar_final = letra + numero
        } else {
            const servicio_letra = info.filter(x => x.id === data.ID_SERVICIO)[0].letra
            lugar_final = servicio_letra + '1'

        }

        const turnoPost = await prisma.tURNOS.create({
            data: {
                ID_CLIENTE: data.ID_CLIENTE,
                ID_EMPLEADO: empleadoSeleccionado.ID_EMPLEADO,
                ID_SERVICIO: data.ID_SERVICIO,
                ID_ESTADO: 1,
                FECHA: new Date(),
                LUGAR: lugar_final
            }
        });

        const turno = await prisma.tURNOS.findUnique({
            where: {
              ID_TURNO: turnoPost.ID_TURNO,
            },
            select: {
              FECHA: true,
              LUGAR: true,
              EMPLEADO: {
                select: {
                  NOMBRE: true,
                  APELLIDO: true
                },
              },
              SERVICIO: {
                select: {
                  DESCRIPCION: true,
                },
              },
              ESTADO: {
                select: {
                  DESCRIPCION: true,
                },
              },
            },
          });


        const formattedTurno = {
            NOMBRE_EMPLEADO: `${turno.EMPLEADO.NOMBRE} ${turno.EMPLEADO.APELLIDO}`,
            SERVICIO_DESCRIPCION: turno.SERVICIO.DESCRIPCION,
            ESTADO_DESCRIPCION: turno.ESTADO.DESCRIPCION,
            FECHA: turno.FECHA,
            LUGAR: turno.LUGAR,
        };


        res.status(200).json(formattedTurno)

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error en el servidor.' });
    }
});

// turnos en espera
router.get('/turnos', async (req, res) => {
    try {

        const turnos_espera = await prisma.tURNOS.findMany({
            where: {
                ID_ESTADO: 1
            }
        });

        res.status(200).json(turnos_espera);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error en el servidor.' });
    }
});

router.put('/turno/:id', async (req, res) => {
    try {


        const id_turno = parseInt(req.params.id);
        const turnoActualizado = await prisma.TURNOS.update({
            where: {
                ID_TURNO: id_turno
            },
            data: {
                ID_ESTADO: 3
            }
        });


        res.status(200).json(turnoActualizado);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error en el servidor.' });
    }
});




export default router;