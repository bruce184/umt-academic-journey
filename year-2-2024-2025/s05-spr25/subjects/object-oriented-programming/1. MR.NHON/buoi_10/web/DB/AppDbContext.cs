using DriverManagerment.Model;
using Microsoft.EntityFrameworkCore;

namespace DriverManagerment.DB{
    public class AppDbContext : DbContext{
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Student> Students { get; set; }
    }
}
