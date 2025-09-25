import axios from "axios";

type Student = {
    id: string;
    name: string;
    age: number;
    email: string;
    phone: string;
    subject: string;
}

export const findStudentByEmail = async (email: string): Promise<Student> => {

    const response = await axios.get("http://localhost:8081/api/student/getStudents", {
        params: {
            searchParam: "email",
            searchValue: email,
            page: 0,
            limit: 5
        }
    })

    return response.data?.body as Student;
}