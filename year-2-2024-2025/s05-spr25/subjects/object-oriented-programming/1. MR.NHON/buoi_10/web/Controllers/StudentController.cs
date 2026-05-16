using DriverManagerment.DB;
using DriverManagerment.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DriverManagerment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ Lấy danh sách sinh viên
        [HttpGet]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _context.Students.ToListAsync();
            return Ok(students);
        }

        // ✅ Lấy thông tin sinh viên theo mã số sinh viên
        [HttpGet("{studentId}")]
        public async Task<IActionResult> GetStudent(string studentId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == studentId);
            if (student == null)
                return NotFound(new { message = "Student not found" });

            return Ok(student);
        }

        // ✅ Thêm mới sinh viên
        [HttpPost]
        public async Task<IActionResult> CreateStudent([FromBody] Student student)
        {
            if (student == null || !ModelState.IsValid)
                return BadRequest(new { message = "Invalid student data" });

            _context.Students.Add(student);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetStudent), new { studentId = student.Id }, student);
        }

        // ✅ Cập nhật thông tin sinh viên
        [HttpPut("{studentId}")]
        public async Task<IActionResult> UpdateStudent(string studentId, [FromBody] Student updatedStudent)
        {
            if (updatedStudent == null || studentId != updatedStudent.Id || !ModelState.IsValid)
                return BadRequest(new { message = "Invalid student data" });

            var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == studentId);
            if (student == null)
                return NotFound(new { message = "Student not found" });

            student.Name = updatedStudent.Name;
            student.Age = updatedStudent.Age;
            student.Email = updatedStudent.Email;

            _context.Students.Update(student);
            await _context.SaveChangesAsync();
            return Ok(student);
        }

        // ✅ Xóa sinh viên
        [HttpDelete("{studentId}")]
        public async Task<IActionResult> DeleteStudent(string studentId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == studentId);
            if (student == null)
                return NotFound(new { message = "Student not found" });

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Student deleted successfully" });
        }
    }
}
