export const typeDefs = `#graphql
  type Student {
    id: ID!
    name: String!
    email: String!
    enrollments(limit: Int, offset: Int): [Enrollment!]!
    courses(limit: Int, offset: Int): [Course!]!
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    credits: Int!
    enrollments(limit: Int, offset: Int): [Enrollment!]!
    students(limit: Int, offset: Int): [Student!]!
  }

  type Enrollment {
    id: ID!
    studentId: ID!
    courseId: ID!
    status: String!
    student: Student
    course: Course
  }

  type AuthPayload {
    token: String!
    student: Student!
  }

  type PageInfo {
    total: Int!
    limit: Int!
    offset: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type StudentPage {
    items: [Student!]!
    pageInfo: PageInfo!
  }

  type CoursePage {
    items: [Course!]!
    pageInfo: PageInfo!
  }

  type EnrollmentPage {
    items: [Enrollment!]!
    pageInfo: PageInfo!
  }

  type Query {
    student(id: ID!): Student
    me: Student
    students(limit: Int, offset: Int): [Student!]!
    studentsPage(limit: Int, offset: Int): StudentPage!
    course(id: ID!): Course
    courses(limit: Int, offset: Int): [Course!]!
    coursesPage(limit: Int, offset: Int): CoursePage!
    enrollment(id: ID!): Enrollment
    enrollments(limit: Int, offset: Int): [Enrollment!]!
    enrollmentsPage(limit: Int, offset: Int): EnrollmentPage!
    enrollmentsByStudent(studentId: ID!, limit: Int, offset: Int): [Enrollment!]!
    enrollmentsByCourse(courseId: ID!, limit: Int, offset: Int): [Enrollment!]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    createStudent(input: CreateStudentInput!): Student!
    createCourse(input: CreateCourseInput!): Course!
    enrollStudent(input: EnrollStudentInput!): Enrollment!
  }

  input CreateStudentInput {
    name: String!
    email: String!
    password: String!
  }

  input CreateCourseInput {
    title: String!
    description: String
    credits: Int!
  }

  input EnrollStudentInput {
    studentId: ID!
    courseId: ID!
  }
`;
