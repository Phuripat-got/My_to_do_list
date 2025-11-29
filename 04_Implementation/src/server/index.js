const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const server = http.createServer(app);

// ตั้งค่า Socket.io ให้ยอมรับ CORS จาก Frontend
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // URL ของ Frontend
    methods: ["GET", "POST"]
  }
});

// Mock Database (ใช้ Array แทน MongoDB เพื่อให้รันง่ายสำหรับส่งงาน)
let tasks = [
    { id: '1', title: 'ประชุมทีม 10 โมง', isCompleted: false, createdBy: 'System', createdAt: Date.now() }
];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 1. ส่งข้อมูลเริ่มต้นให้คนที่เพิ่งเข้ามา
  socket.emit('initTasks', tasks);

  // 2. รับ Event สร้างงานใหม่
  socket.on('addTask', (data) => {
    const newTask = {
      id: uuidv4(),
      title: data.title,
      isCompleted: false,
      createdBy: data.user || 'Anonymous',
      createdAt: Date.now()
    };
    tasks.push(newTask);
    
    // Broadcast บอกทุกคน (รวมถึงคนส่งด้วย)
    io.emit('taskAdded', newTask);
  });

  // 3. รับ Event ลบงาน
  socket.on('deleteTask', (id) => {
    tasks = tasks.filter(t => t.id !== id);
    io.emit('taskDeleted', id);
  });

  // 4. รับ Event เปลี่ยนสถานะงาน (เสร็จ/ไม่เสร็จ)
  socket.on('toggleTask', (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.isCompleted = !task.isCompleted;
      io.emit('taskUpdated', task);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
