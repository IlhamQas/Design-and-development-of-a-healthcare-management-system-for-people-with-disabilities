import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import http from 'http';
import { Server } from 'socket.io';
import * as indexRouter from './src/modules/index.route.js'
import connectDB from './DB/connection.js'


const app = express();
dotenv.config()
connectDB()
app.use(cors({
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
//app.use(express.json())
// Increase payload limit (e.g., 50MB)
app.use(express.json({ limit: '50mb' })); // For JSON data
app.use(express.urlencoded({ limit: '50mb', extended: true })); // For form data


app.use('/api/v1/auth', indexRouter.authRouter)
app.use('/api/v1/pending', indexRouter.pendingRouter)
app.use('/api/v1/admin', indexRouter.adminRouter)
app.use('/api/v1/appointment', indexRouter.AppointmentRouter);
app.use('/api/v1/pendingAppointment', indexRouter.pendingAppointmentRouter)
app.use('/api/v1/product',indexRouter.productRouter)
app.use('/api/v1/order',indexRouter.orderRouter)
app.use('/api/v1/financial', indexRouter.financialRouter)
app.use('/api/v1/sale', indexRouter.salesRouter)
app.use('/api/v1/medical', indexRouter.medicalReportRouter)
app.use('/api/v1/profile', indexRouter.profileRouter)
app.use('/api/v1/contact',indexRouter.ContactRouter)
app.use('/api/v1/updateImage', indexRouter.updatedProfileimage);
app.use('/api/v1/chat', indexRouter.chatRouter);
app.use('/api/v1/notification',indexRouter.NotificationRouter)
app.use('/api/v1/TreatmentPlan',indexRouter.TreatmentPlanRouter)
app.use('/api/v1/Doctor',indexRouter.DoctorScheduleRouter)
app.use('/api/v1/Guardian',indexRouter.GuardianScheduleRouter)
app.use('/api/v1/sessionRecord',indexRouter.sessionRecordRouter)
app.use('/api/v1/dep',indexRouter.DepartmentRouter)
app.use('/api/v1/evaluation',indexRouter.childEvaluationRouter)
app.use('/api/v1/post',indexRouter.postRouter)

app.use('*', (req, res) => {
    res.status(404).json({ message: "Page not found" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
})

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(` New client connected: ${socket.id}`);

  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('User Online:', userId);
  });

  socket.on('privateMessage', ({ senderId, receiverId, message }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('privateMessage', {
        senderId,
        message
      });
    }
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log(` Client disconnected: ${socket.id}`);
  });
});


server.listen(process.env.port, () => {
  console.log(`Running Server on port ${process.env.port}`);
});


export { io , onlineUsers  };




