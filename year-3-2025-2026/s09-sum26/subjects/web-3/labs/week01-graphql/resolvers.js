import {db as defaultDb} from "./db/db.js"
import { GraphQLError } from "graphql";
import { createToken, requireAuth, verifyPassword, hashPassword } from "./auth.js"; 

const COURSE_TABLE = "courses";
const STUDENTS_TABLE = "students";
const ENROLLMENT_TABLE = "enrollments";
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const invalidCredentialsError = () =>
    new GraphQLError("Invalid credentials", {
        extensions: { code: "UNAUTHENTICATED" },
    });

function getDb(context){
    return context?.db || defaultDb;
}

function getPagination({limit, offset} = {}){
    return {
        limit: Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT),
        offset: offset ?? 0
    };
}

function coursesQuery(db) {
    return db(COURSE_TABLE).select("*").orderBy("id");
}

function studentsQuery(db) {
    return db(STUDENTS_TABLE).select("*").orderBy("id");
}

function applyPagination(builder, args = {}) {
    const {limit, offset} = getPagination(args);
    return {query: builder.limit(limit).offset(offset), limit, offset};
}

async function toPage(query, args)  {
    const {limit, offset} = getPagination(args);
    const countQuery = query
        .clone()
        .clearSelect()
        .clearOrder()
        .count("* as count")
        .first();
    const itemsQuery = query.clone().limit(limit).offset(offset);
    const [countResult, items] = await Promise.all([countQuery, itemsQuery]);
    const total = Number(countResult?.count || 0);
    
    return {
        items,
        pageInfo: {
            total,
            limit,
            offset,
            hasNextPage: offset + limit < total,
            hasPrevPage: offset > 0,
        },
    };
}

export const resolvers = {
    Query: {
        courses: async (_, args, context) => {
            requireAuth(context);
            const db = getDb(context);
            return applyPagination(coursesQuery(db), args).query;
        },
        coursesPage: async (_, args, context) => {
            requireAuth(context);
            const db = getDb(context);
            return toPage(coursesQuery(db), args);
        },

        course: async (_, {id}, context) => {
            requireAuth(context);
            const db = getDb(context);
            return db(COURSE_TABLE).where({id}).first();
        },

        studentsPage: async (_, args, context) => {
            requireAuth(context);
            const db = getDb(context);
            return toPage(studentsQuery(db), args);
        },

        student: async (_, {id}, context) => {
            requireAuth(context);
            const db = getDb(context);
            return db(STUDENTS_TABLE).where({id}).first();
        },
    },
    
    Mutation: {
        login: async (_, {email, password}, context) => {
            const db = getDb(context);
            const student = await db(STUDENTS_TABLE).where({email}).first();

            if (!student || !verifyPassword(password, student.password)) {
                throw invalidCredentialsError();
            }

            const token = createToken(student);
            return {
                token,
                student,
            };
        },

        createCourse: async (_, {input}, context) => {
            requireAuth(context);
            const db = getDb(context);
            const [course] = await db(COURSE_TABLE).insert({
                title: input.title,
                description: input.description ?? null,
            }).returning("*");
            return course;
        },

        createStudent: async (_, {input}, context) => {
            const db = getDb(context);
            const [student] = await db(STUDENTS_TABLE).insert({
                name: input.name,
                email: input.email,
                password: hashPassword(input.password),
            }).returning("*");
            return student;
        },

        enrollCourse: async (_, {courseId}, context) => {
            const user = requireAuth(context);
            const db = getDb(context);
            
            const existing = await db(ENROLLMENT_TABLE).where({
                student_id: user.id,
                course_id: courseId
            }).first();

            if (!existing) {
                await db(ENROLLMENT_TABLE).insert({
                    student_id: user.id,
                    course_id: courseId
                });
            }

            return db(COURSE_TABLE).where({id: courseId}).first();
        },

        unenrollCourse: async (_, {courseId}, context) => {
            const user = requireAuth(context);
            const db = getDb(context);
            
            await db(ENROLLMENT_TABLE).where({
                student_id: user.id,
                course_id: courseId
            }).del();

            return db(COURSE_TABLE).where({id: courseId}).first();
        }
    },

    Course: {
        students: async (course, _, context) => {
            requireAuth(context);

            const enrollments = await getDb(context)(ENROLLMENT_TABLE).where({course_id: course.id}).select("student_id").orderBy("student_id");

            return Promise.all(
                enrollments.map(enrollment =>
                    context.loaders.studentsById.load(enrollment.student_id)
                )
            );
        },

        studentCount: async (course, _, context) => {
            requireAuth(context);
           
            const result = await getDb(context)(ENROLLMENT_TABLE).where({course_id: course.id}).count("* as count").first();
            
            return Number(result?.count || 0);  
        }
    },
    
}