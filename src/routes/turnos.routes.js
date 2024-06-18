import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router();

router.post('/turno', async (req, res) => {
    try {

        const data = req.body

        // Trae los empleados que puedan brindar el servico escogido 
        // const empleados = await prisma.EMPLEADOS_SERVICIOS.findMany({
        //     where: {
        //         ID_SERVICIO: data.ID_SERVICIO
        //     },
        //     include: {
        //         EMPLEADO: true
        //     }
        // });

        // const empleadoSeleccionado = empleados[Math.random() * (empleados.length - 1)]

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
                ID_EMPLEADO: null,
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
            NOMBRE_EMPLEADO: '',
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
                ID_ESTADO: {
                    in:[1,2]
                }
            }
        });

        let turnos_Libre = []

        // Filtra los empleados que estan libres para dar el servicio 
        const procesarTurnos = async () => {

            for (const turno of turnos_espera) {

                const turno_filtrados = await prisma.tURNOS.findUnique({
                    where: {
                        ID_TURNO: turno.ID_TURNO,
                    },
                    select: {
                        FECHA: true,
                        LUGAR: true,
                        ID_TURNO:true,
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
                    }
                });


                turnos_Libre.push(turno_filtrados);
            }
            return turnos_Libre;
        };

        const turnos_finales = await procesarTurnos()
        let turnos_bien = []

        for (const element of turnos_finales) {

            turnos_bien.push({
                ID: element.ID_TURNO,
                NOMBRE_EMPLEADO: '',
                SERVICIO_DESCRIPCION: element.SERVICIO.DESCRIPCION,
                ESTADO_DESCRIPCION: element.ESTADO.DESCRIPCION,
                FECHA: element.FECHA,
                LUGAR: element.LUGAR,
            });
        }

        const turnosFilter = turnos_bien.sort((a, b) => new Date(a.FECHA) - new Date(b.FECHA));

        const turnosUnicos = new Set();
        const filtrados = [];

        turnosFilter.forEach(item => {
            if (!turnosUnicos.has(item.SERVICIO_DESCRIPCION)) {
                turnosUnicos.add(item.SERVICIO_DESCRIPCION);
                filtrados.push(item);
            }
        });

        res.status(200).json(filtrados);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error en el servidor.' });
    }
});

// Endpoint para actualizar el estado del turno a finializado
router.put('/turnoUpdate', async (req, res) => {
    try {


        const data = req.body
           
        const turnoActualizado = await prisma.TURNOS.update({
            where: { ID_TURNO: data.ID },
            data: { ID_ESTADO: 3 }
        });

        res.status(200).json(turnoActualizado);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error en el servidor.' });
    }
});

// EndPoint para el empleado cuando inicia y siguinte turnos
router.get('/turno/:id', async (req, res) => {
    try {

        const id_empleado = parseInt(req.params.id);

        const turnosEmpleado = await prisma.eMPLEADOS_SERVICIOS.findMany({
            where: {
                ID_EMPLEADO: id_empleado
            }
        });

        const servicios = turnosEmpleado.map(x => x.ID_SERVICIO)

        const turnos = await prisma.tURNOS.findMany({
            where: {
                ID_SERVICIO: {
                    in: servicios,
                },
                ID_EMPLEADO: null,
            },
            orderBy: {
                FECHA: 'asc',
            },
        });

        if(turnos.length > 0){
            const id_turno = turnos[0].ID_TURNO
    
            const turnoActualizado = await prisma.tURNOS.update({
                where: {
                    ID_TURNO: id_turno,
                },
                data: {
                    ID_EMPLEADO: id_empleado,
                    ID_ESTADO: 2,  
                },
            });
    
            const turno_formateado = await prisma.tURNOS.findUnique({
                where: {
                    ID_TURNO: turnoActualizado.ID_TURNO,
                },
                select: {
                    FECHA: true,
                    LUGAR: true,
                    ID_TURNO: true,
                    CLIENTE:{
                        select:{
                            NOMBRE:true,
                            APELLIDO: true                    
                        }
                    },
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
    
            const turnos_bien = {
                ID: turno_formateado.ID_TURNO,
                NOMBRE_EMPLEADO: turno_formateado.EMPLEADO.NOMBRE + ' '+ turno_formateado.EMPLEADO.APELLIDO,
                SERVICIO_DESCRIPCION: turno_formateado.SERVICIO.DESCRIPCION,
                ESTADO_DESCRIPCION: turno_formateado.ESTADO.DESCRIPCION,
                CLIENTE : turno_formateado.CLIENTE.NOMBRE + ' '+ turno_formateado.CLIENTE.APELLIDO,
                FECHA: turno_formateado.FECHA,
                LUGAR: turno_formateado.LUGAR,
            };
            res.status(200).json(turnos_bien);
        }else{
            res.status(200).json([]);
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error en el servidor.' });
    }

})

// Endpoint para dar siguiente en los turnos
// router.get('/turnoSiguiente/:id', async (req, res) => {
//     try {

//         const id_empleado = parseInt(req.params.id);
//         const data = req.body

//         // const turnosEmpleado = await prisma.eMPLEADOS_SERVICIOS.findMany({
//         //     where: {
//         //         ID_EMPLEADO: id_empleado
//         //     }
//         // });

//         const servicios = turnosEmpleado.map(x => x.ID_SERVICIO)

//         const turnos = await prisma.tURNOS.findMany({
//             where: {
//                 ID_SERVICIO: {
//                     in: servicios,
//                 },
//                 ID_EMPLEADO: null,
//             },
//             orderBy: {
//                 FECHA: 'asc',
//             },
//         });

//         if(turnos.length > 0){
//             const id_turno = turnos[0].ID_TURNO
    
//             const turnoActualizado = await prisma.tURNOS.update({
//                 where: {
//                     ID_TURNO: id_turno,
//                 },
//                 data: {
//                     ID_EMPLEADO: id_empleado,
//                     ID_ESTADO: 2,  
//                 },
//             });
    
//             const turno_formateado = await prisma.tURNOS.findUnique({
//                 where: {
//                     ID_TURNO: turnoActualizado.ID_TURNO,
//                 },
//                 select: {
//                     FECHA: true,
//                     LUGAR: true,
//                     ID_TURNO: true,
//                     EMPLEADO: {
//                         select: {
//                             NOMBRE: true,
//                             APELLIDO: true
//                         },
//                     },
//                     SERVICIO: {
//                         select: {
//                             DESCRIPCION: true,
//                         },
//                     },
//                     ESTADO: {
//                         select: {
//                             DESCRIPCION: true,
//                         },
//                     },
//                 },
//             });
    
//             const turnos_bien = {
//                 ID: turno_formateado.ID_TURNO,
//                 NOMBRE_EMPLEADO: turno_formateado.EMPLEADO.NOMBRE + ' '+ turno_formateado.EMPLEADO.APELLIDO,
//                 SERVICIO_DESCRIPCION: turno_formateado.SERVICIO.DESCRIPCION,
//                 ESTADO_DESCRIPCION: turno_formateado.ESTADO.DESCRIPCION,
//                 FECHA: turno_formateado.FECHA,
//                 LUGAR: turno_formateado.LUGAR,
//             };
//             res.status(200).json(turnos_bien);
//         }else{
//             res.status(200).json([]);
//         }


//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Ha ocurrido un error en el servidor.' });
//     }

// })





export default router;