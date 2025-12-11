import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import Footer from "./Footer";

const LoginComponent = ({ setStudent, setNotification, db }) => {
  const [studentCode, setStudentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedCode = studentCode.trim();
    if (!trimmedCode) {
      setNotification({
        type: "error",
        message: "Por favor, insira o seu código.",
      });
      return;
    }
    setIsLoading(true);

    try {
      const studentsMasterRef = collection(db, "students");
      const masterQuery = query(
        studentsMasterRef,
        where("code", "==", trimmedCode)
      );
      const masterQuerySnapshot = await getDocs(masterQuery);

      if (masterQuerySnapshot.empty) {
        setNotification({
          type: "error",
          message: "Código de aluno não encontrado.",
        });
        setIsLoading(false);
        return;
      }

      const studentMasterData = {
        id: masterQuerySnapshot.docs[0].id,
        ...masterQuerySnapshot.docs[0].data(),
      };
      let studentGradesData = null;
      const concludentesRef = collection(db, "concludentes");
      const concludentesQuery = query(
        concludentesRef,
        where("code", "==", trimmedCode)
      );
      const concludentesSnapshot = await getDocs(concludentesQuery);

      if (!concludentesSnapshot.empty) {
        studentGradesData = concludentesSnapshot.docs[0].data();
      } else {
        const classesRef = collection(db, "classes");
        const classesSnapshot = await getDocs(classesRef);

        for (const classDoc of classesSnapshot.docs) {
          const classData = classDoc.data();
          if (classData.students && Array.isArray(classData.students)) {
            const foundStudent = classData.students.find(
              (s) => String(s.code) === trimmedCode
            );
            if (foundStudent) {
              studentGradesData = foundStudent;
              break;
            }
          }
        }
      }

      if (studentGradesData) {
        const fullStudentData = {
          ...studentMasterData,
          grades: studentGradesData.grades || {},
        };
        setNotification({
          type: "success",
          message: "Login realizado com sucesso!",
        });
        setStudent(fullStudentData);
      } else {
        throw new Error(
          "Suas notas ainda não foram lançadas. Fale com a secretaria."
        );
      }
    } catch (error) {
      console.error("Erro ao fazer login: ", error);
      setNotification({
        type: "error",
        message: error.message || "Ocorreu um erro ao tentar fazer login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Portal do Aluno
            </h1>
            <p className="text-gray-500 mt-2">
              Consulte as suas notas e frequência
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label
                htmlFor="studentCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Seu Código de Aluno
              </label>
              <input
                id="studentCode"
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o seu código aqui"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors duration-300"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginComponent;
