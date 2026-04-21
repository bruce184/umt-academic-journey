const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/database');

const seedData = async () => {
  try {
    const pool = getPool();
    
    console.log('🌱 Starting to seed data...');

    // Hash password for all users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Insert semesters
    console.log('📅 Inserting semesters...');
    await pool.request()
      .input('semesterCode', sql.VarChar(20), 'Fall')
      .input('year', sql.Int, 2024)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM semesters WHERE semester_code = @semesterCode AND year = @year)
        INSERT INTO semesters (semester_code, year) VALUES (@semesterCode, @year)
      `);

    await pool.request()
      .input('semesterCode', sql.VarChar(20), 'Spring')
      .input('year', sql.Int, 2024)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM semesters WHERE semester_code = @semesterCode AND year = @year)
        INSERT INTO semesters (semester_code, year) VALUES (@semesterCode, @year)
      `);

    // Insert courses
    console.log('📚 Inserting courses...');
    const courses = [
      { code: 'CS101', name: 'Introduction to Computer Science', credit: 3, type: 'L' },
      { code: 'CS102', name: 'Programming Fundamentals', credit: 4, type: 'P' },
      { code: 'MATH101', name: 'Calculus I', credit: 4, type: 'L' },
      { code: 'ENG101', name: 'English Composition', credit: 3, type: 'L' },
      { code: 'PHYS101', name: 'Physics I', credit: 4, type: 'L' }
    ];

    for (const course of courses) {
      await pool.request()
        .input('code', sql.VarChar(10), course.code)
        .input('name', sql.VarChar(100), course.name)
        .input('credit', sql.Int, course.credit)
        .input('type', sql.Char(1), course.type)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM courses WHERE course_code = @code)
          INSERT INTO courses (course_code, course_name, credit, course_type) 
          VALUES (@code, @name, @credit, @type)
        `);
    }

    // Insert users (students, lecturers, admin)
    console.log('👥 Inserting users...');
    const users = [
      // Admin
      { id: 'ADMIN001', username: 'admin', fullName: 'System Administrator', role: 'admin', email: 'admin@ocms.edu' },
      
      // Lecturers
      { id: 'LEC001', username: 'dr.smith', fullName: 'Dr. John Smith', role: 'lecturer', email: 'smith@ocms.edu' },
      { id: 'LEC002', username: 'dr.jones', fullName: 'Dr. Sarah Jones', role: 'lecturer', email: 'jones@ocms.edu' },
      { id: 'LEC003', username: 'prof.brown', fullName: 'Prof. Michael Brown', role: 'lecturer', email: 'brown@ocms.edu' },
      
      // Students
      { id: 'STU001', username: 'student1', fullName: 'Alice Johnson', role: 'student', email: 'alice@student.ocms.edu' },
      { id: 'STU002', username: 'student2', fullName: 'Bob Wilson', role: 'student', email: 'bob@student.ocms.edu' },
      { id: 'STU003', username: 'student3', fullName: 'Carol Davis', role: 'student', email: 'carol@student.ocms.edu' },
      { id: 'STU004', username: 'student4', fullName: 'David Miller', role: 'student', email: 'david@student.ocms.edu' },
      { id: 'STU005', username: 'student5', fullName: 'Eva Garcia', role: 'student', email: 'eva@student.ocms.edu' }
    ];

    for (const user of users) {
      await pool.request()
        .input('userId', sql.VarChar(10), user.id)
        .input('username', sql.VarChar(50), user.username)
        .input('passwordHash', sql.VarChar(255), hashedPassword)
        .input('fullName', sql.VarChar(100), user.fullName)
        .input('role', sql.VarChar(20), user.role)
        .input('email', sql.VarChar(255), user.email)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = @userId)
          INSERT INTO users (user_id, username, password_hash, full_name, role, email)
          VALUES (@userId, @username, @passwordHash, @fullName, @role, @email)
        `);

      // Insert into role-specific table
      switch (user.role) {
        case 'admin':
          await pool.request()
            .input('adminId', sql.VarChar(10), user.id)
            .query(`
              IF NOT EXISTS (SELECT 1 FROM admins WHERE admin_id = @adminId)
              INSERT INTO admins (admin_id) VALUES (@adminId)
            `);
          break;
        case 'lecturer':
          await pool.request()
            .input('lecturerId', sql.VarChar(10), user.id)
            .query(`
              IF NOT EXISTS (SELECT 1 FROM lecturers WHERE lecturer_id = @lecturerId)
              INSERT INTO lecturers (lecturer_id) VALUES (@lecturerId)
            `);
          break;
        case 'student':
          await pool.request()
            .input('studentId', sql.VarChar(10), user.id)
            .query(`
              IF NOT EXISTS (SELECT 1 FROM students WHERE student_id = @studentId)
              INSERT INTO students (student_id) VALUES (@studentId)
            `);
          break;
      }
    }

    // Insert classes
    console.log('🏫 Inserting classes...');
    const classes = [
      { id: 'CS101-F24-01', courseCode: 'CS101', semesterCode: 'Fall', year: 2024, capacity: 30 },
      { id: 'CS102-F24-01', courseCode: 'CS102', semesterCode: 'Fall', year: 2024, capacity: 25 },
      { id: 'MATH101-F24-01', courseCode: 'MATH101', semesterCode: 'Fall', year: 2024, capacity: 35 },
      { id: 'ENG101-F24-01', courseCode: 'ENG101', semesterCode: 'Fall', year: 2024, capacity: 30 },
      { id: 'PHYS101-F24-01', courseCode: 'PHYS101', semesterCode: 'Fall', year: 2024, capacity: 30 }
    ];

    for (const cls of classes) {
      await pool.request()
        .input('classId', sql.VarChar(15), cls.id)
        .input('courseCode', sql.VarChar(10), cls.courseCode)
        .input('semesterCode', sql.VarChar(20), cls.semesterCode)
        .input('year', sql.Int, cls.year)
        .input('capacity', sql.Int, cls.capacity)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM classes WHERE class_id = @classId)
          INSERT INTO classes (class_id, course_code, semester_code, year, capacity, current_enrollment)
          VALUES (@classId, @courseCode, @semesterCode, @year, @capacity, 0)
        `);
    }

    // Insert schedules
    console.log('📅 Inserting schedules...');
    const schedules = [
      { id: 'SCH001', classId: 'CS101-F24-01', room: 'Room 101', timeSlot: 'Monday 9:00 AM - 10:30 AM' },
      { id: 'SCH002', classId: 'CS102-F24-01', room: 'Lab 201', timeSlot: 'Tuesday 2:00 PM - 4:00 PM' },
      { id: 'SCH003', classId: 'MATH101-F24-01', room: 'Room 102', timeSlot: 'Wednesday 10:00 AM - 11:30 AM' },
      { id: 'SCH004', classId: 'ENG101-F24-01', room: 'Room 103', timeSlot: 'Thursday 1:00 PM - 2:30 PM' },
      { id: 'SCH005', classId: 'PHYS101-F24-01', room: 'Lab 301', timeSlot: 'Friday 9:00 AM - 11:00 AM' }
    ];

    for (const schedule of schedules) {
      await pool.request()
        .input('scheduleId', sql.VarChar(15), schedule.id)
        .input('classId', sql.VarChar(15), schedule.classId)
        .input('room', sql.VarChar(50), schedule.room)
        .input('timeSlot', sql.VarChar(30), schedule.timeSlot)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM schedules WHERE schedule_id = @scheduleId)
          INSERT INTO schedules (schedule_id, class_id, room, time_slot)
          VALUES (@scheduleId, @classId, @room, @timeSlot)
        `);
    }

    // Insert class instructors
    console.log('👨‍🏫 Inserting class instructors...');
    const instructors = [
      { classId: 'CS101-F24-01', instructorId: 'LEC001', role: 'primary', semesterCode: 'Fall', year: 2024 },
      { classId: 'CS102-F24-01', instructorId: 'LEC002', role: 'primary', semesterCode: 'Fall', year: 2024 },
      { classId: 'MATH101-F24-01', instructorId: 'LEC003', role: 'primary', semesterCode: 'Fall', year: 2024 },
      { classId: 'ENG101-F24-01', instructorId: 'LEC001', role: 'primary', semesterCode: 'Fall', year: 2024 },
      { classId: 'PHYS101-F24-01', instructorId: 'LEC002', role: 'primary', semesterCode: 'Fall', year: 2024 }
    ];

    for (const instructor of instructors) {
      await pool.request()
        .input('classId', sql.VarChar(15), instructor.classId)
        .input('instructorId', sql.VarChar(10), instructor.instructorId)
        .input('role', sql.VarChar(20), instructor.role)
        .input('semesterCode', sql.VarChar(20), instructor.semesterCode)
        .input('year', sql.Int, instructor.year)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM class_instructors WHERE class_id = @classId AND instructor_id = @instructorId)
          INSERT INTO class_instructors (class_id, instructor_id, role, semester_code, year)
          VALUES (@classId, @instructorId, @role, @semesterCode, @year)
        `);
    }

    // Insert enrollments
    console.log('📝 Inserting enrollments...');
    const enrollments = [
      { classId: 'CS101-F24-01', studentId: 'STU001' },
      { classId: 'CS101-F24-01', studentId: 'STU002' },
      { classId: 'CS101-F24-01', studentId: 'STU003' },
      { classId: 'CS102-F24-01', studentId: 'STU001' },
      { classId: 'CS102-F24-01', studentId: 'STU004' },
      { classId: 'MATH101-F24-01', studentId: 'STU002' },
      { classId: 'MATH101-F24-01', studentId: 'STU005' },
      { classId: 'ENG101-F24-01', studentId: 'STU003' },
      { classId: 'ENG101-F24-01', studentId: 'STU004' },
      { classId: 'PHYS101-F24-01', studentId: 'STU001' },
      { classId: 'PHYS101-F24-01', studentId: 'STU005' }
    ];

    for (const enrollment of enrollments) {
      await pool.request()
        .input('classId', sql.VarChar(15), enrollment.classId)
        .input('studentId', sql.VarChar(10), enrollment.studentId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM enrollments WHERE class_id = @classId AND student_id = @studentId)
          INSERT INTO enrollments (class_id, student_id, status)
          VALUES (@classId, @studentId, 'enrolled')
        `);
    }

    // Update current enrollment counts
    console.log('📊 Updating enrollment counts...');
    await pool.request().query(`
      UPDATE c 
      SET current_enrollment = (
        SELECT COUNT(*) 
        FROM enrollments e 
        WHERE e.class_id = c.class_id AND e.status = 'enrolled'
      )
      FROM classes c
    `);

    // Insert assignments
    console.log('📋 Inserting assignments...');
    const assignments = [
      { title: 'Introduction to Programming', description: 'Basic programming concepts', classId: 'CS101-F24-01', maxScore: 10.0 },
      { title: 'Variables and Data Types', description: 'Understanding variables and data types', classId: 'CS102-F24-01', maxScore: 10.0 },
      { title: 'Calculus Quiz 1', description: 'Limits and continuity', classId: 'MATH101-F24-01', maxScore: 10.0 },
      { title: 'Essay Writing', description: 'Write a 500-word essay', classId: 'ENG101-F24-01', maxScore: 10.0 },
      { title: 'Physics Lab Report', description: 'Lab report on motion', classId: 'PHYS101-F24-01', maxScore: 10.0 }
    ];

    for (const assignment of assignments) {
      await pool.request()
        .input('title', sql.VarChar(200), assignment.title)
        .input('description', sql.VarChar(500), assignment.description)
        .input('classId', sql.VarChar(15), assignment.classId)
        .input('maxScore', sql.Decimal(3,1), assignment.maxScore)
        .query(`
          INSERT INTO assignments (title, description, class_id, max_score, due_date)
          VALUES (@title, @description, @classId, @maxScore, DATEADD(day, 7, GETDATE()))
        `);
    }

    // Insert announcements
    console.log('📢 Inserting announcements...');
    const announcements = [
      { id: 'ANN001', classId: 'CS101-F24-01', title: 'Welcome to CS101', content: 'Welcome to Introduction to Computer Science!' },
      { id: 'ANN002', classId: 'CS102-F24-01', title: 'Lab Schedule', content: 'Labs will be held every Tuesday from 2-4 PM.' },
      { id: 'ANN003', classId: 'MATH101-F24-01', title: 'Quiz Reminder', content: 'Quiz 1 will be held next week.' },
      { id: 'ANN004', classId: 'ENG101-F24-01', title: 'Essay Due Date', content: 'Essays are due by the end of this week.' },
      { id: 'ANN005', classId: 'PHYS101-F24-01', title: 'Lab Safety', content: 'Please review lab safety guidelines before next class.' }
    ];

    for (const announcement of announcements) {
      await pool.request()
        .input('announcementId', sql.VarChar(15), announcement.id)
        .input('classId', sql.VarChar(15), announcement.classId)
        .input('title', sql.VarChar(200), announcement.title)
        .input('content', sql.VarChar(500), announcement.content)
        .query(`
          INSERT INTO announcements (announcement_id, class_id, title, content)
          VALUES (@announcementId, @classId, @title, @content)
        `);
    }

    // Insert tuition payments
    console.log('💰 Inserting tuition payments...');
    const payments = [
      { studentId: 'STU001', semesterCode: 'Fall', year: 2024, amount: 1500.00, status: 'paid' },
      { studentId: 'STU002', semesterCode: 'Fall', year: 2024, amount: 1500.00, status: 'paid' },
      { studentId: 'STU003', semesterCode: 'Fall', year: 2024, amount: 1500.00, status: 'pending' },
      { studentId: 'STU004', semesterCode: 'Fall', year: 2024, amount: 1500.00, status: 'paid' },
      { studentId: 'STU005', semesterCode: 'Fall', year: 2024, amount: 1500.00, status: 'pending' }
    ];

    for (const payment of payments) {
      await pool.request()
        .input('studentId', sql.VarChar(10), payment.studentId)
        .input('semesterCode', sql.VarChar(20), payment.semesterCode)
        .input('year', sql.Int, payment.year)
        .input('amount', sql.Decimal(10,2), payment.amount)
        .input('status', sql.VarChar(20), payment.status)
        .input('paymentMethod', sql.VarChar(50), 'Credit Card')
        .query(`
          INSERT INTO tuition_payments (student_id, semester_code, year, amount, payment_method, status)
          VALUES (@studentId, @semesterCode, @year, @amount, @paymentMethod, @status)
        `);
    }

    console.log('✅ Data seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('👨‍💼 Admin: admin / password123');
    console.log('👨‍🏫 Lecturer: dr.smith / password123');
    console.log('👨‍🎓 Student: student1 / password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData; 