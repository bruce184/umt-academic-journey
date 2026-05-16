export const typeDefs = `#graphql
    type Student {
        id: ID! 
        name: String! 
        email: String! 
    }

    type Course {
        id: ID! 
        title: String! 
        description: String! 
        students: [Student!]!
        studentCount: Int!
    }

    type PageInfo {
        total: Int!
        limit: Int!
        offset: Int!
        hasNextPage: Boolean!
        hasPrevPage: Boolean!
    }

    type CoursePage {
        items: [Course!]!
        pageInfo: PageInfo!
    }

    type StudentPage {
        items: [Student!]!
        pageInfo: PageInfo!
    }
    
    type Query {
        courses(limit: Int, offset: Int): [Course!]!
        coursesPage(limit: Int, offset: Int): CoursePage
        course(id: ID!): Course
        studentsPage(limit: Int, offset: Int): StudentPage
        student(id: ID!): Student
    }
    type Mutation {
        createCourse(input: CreateCourseInput!): Course! 
    }

    input CreateCourseInput {
        title: String!
        description: String!
    }
    
    type AuthPayload {
        token: String!
        student: Student!
    }

    type Mutation {
        login(email: String!, password: String!): AuthPayload!
        createCourse(input: CreateCourseInput!): Course!
        createStudent(input: CreateStudentInput!): Student!
        enrollCourse(courseId: ID!): Course!
        unenrollCourse(courseId: ID!): Course!
    }

    input CreateStudentInput {
        name: String!
        email: String!
        password: String!
    }
`;