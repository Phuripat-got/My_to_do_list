const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../client/build')));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// เปลี่ยนโครงสร้างข้อมูลให้มี status แทน isCompleted
let tasks = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.emit('initTasks', tasks);

  socket.on('addTask', (data) => {
    const newTask = {
      id: uuidv4(),
      title: data.title,
      status: 'todo', // [แก้ไข] เปลี่ยนจาก 'pending' เป็น 'todo' ให้ตรงกับ CSS
      createdBy: data.user || 'Anonymous',
      createdAt: Date.now()
    };
    tasks.push(newTask);
    io.emit('taskAdded', newTask);
  });

  socket.on('deleteTask', (id) => {
    tasks = tasks.filter(t => t.id !== id);
    io.emit('taskDeleted', id);
  });

  // ฟังก์ชันใหม่: อัปเดตสถานะ (Dropdown)
  socket.on('updateStatus', (data) => {
    const task = tasks.find(t => t.id === data.id);
    if (task) {
      task.status = data.newStatus;
      io.emit('taskUpdated', task);
    }
  });

  // ฟังก์ชันแก้ไขชื่อ (Edit)
  socket.on('editTask', (data) => {
    const task = tasks.find(t => t.id === data.id);
    if (task) {
      task.title = data.newTitle;
      io.emit('taskUpdated', task);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
