import express  from 'express'
import morgan  from 'morgan'
import authRoutes  from './routes/auth.routes.js'
import serviciosRoutes  from './routes/servicios.routes.js'
import turnosRoutes  from './routes/turnos.routes.js'
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.use('/api', authRoutes)
app.use('/api', serviciosRoutes)

app.use('/api', turnosRoutes)



app.set('port', process.env.PORT || 4001);

app.listen(app.get('port'), () =>{
    console.log("Server corriendo en el puerto: " + app.get('port'));
});