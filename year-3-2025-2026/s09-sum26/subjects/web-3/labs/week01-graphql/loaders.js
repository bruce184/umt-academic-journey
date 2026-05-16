import DataLoader from "dataloader";

const STUDENT_TABLE = "students"
const COURSE_TABLE = "courses"

export function createLoaders(db){
    return {
        courseById: new DataLoader(async (courseIds) => {
            const courses = await db(COURSE_TABLE).whereIn("id", courseIds);
            const courseById = new Map(courses.map(course => [String(course.id), course]));
            
            return courseIds.map((id) => courseById.get(String(id)) ?? null);   
        }),
        studentsById: new DataLoader(async (studentIds)=> {
            const students = await db(STUDENT_TABLE).whereIn("id", studentIds);
            const studentById = new Map(students.map(student => [String(student.id), student]));
                    
            return studentIds.map((id) => studentById.get(String(id)) ?? null);   
        })
    };
}