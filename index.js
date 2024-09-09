const express = require('express');
const admin = require('firebase-admin');
require('dotenv').config(); // Nạp biến môi trường từ file .env

const app = express();
app.use(express.json()); // Để đọc dữ liệu JSON từ request body

// Khởi tạo mội trường SDK của Firebase
admin.initializeApp({
  credential: admin.credential.cert({
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Xử lý ký tự xuống dòng
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    project_id: process.env.FIREBASE_PROJECT_ID,
  }),
});

const db = admin.firestore();
const collection = db.collection('students'); // Collection students trong Firestore

// Tạo sinh viên mới
app.post('/students', async (req, res) => {
  try {
    const student = req.body;
    const docRef = await collection.add(student);
    res.status(201).send({ id: docRef.id, message: 'Student created successfully' });
  } catch (error) {
    res.status(500).send('Error creating student: ' + error.message);
  }
});

// Lấy danh sách sinh viên
app.get('/students', async (req, res) => {
  try {
    const snapshot = await collection.get();
    const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(students);
  } catch (error) {
    res.status(500).send('Error fetching students: ' + error.message);
  }
});

// Lấy thông tin sinh viên theo ID
app.get('/students/:id', async (req, res) => {
  try {
    const doc = await collection.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).send('Student not found');
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error fetching student: ' + error.message);
  }
});

// Cập nhật sinh viên
app.put('/students/:id', async (req, res) => {
  try {
    const updatedStudent = req.body;
    await collection.doc(req.params.id).update(updatedStudent);
    res.status(200).send('Student updated successfully');
  } catch (error) {
    res.status(500).send('Error updating student: ' + error.message);
  }
});

// Xóa sinh viên
app.delete('/students/:id', async (req, res) => {
  try {
    await collection.doc(req.params.id).delete();
    res.status(200).send('Student deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting student: ' + error.message);
  }
});

// Chạy server với port online hoặc 3000 local
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
