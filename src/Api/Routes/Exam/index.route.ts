import { _axios } from "@/Api/axios.config";
import { ___showErrorToastNotification } from "@/lib/sonner";


class ExamRoute {

  async getExams() {
    const response = await _axios.get(`/exams`);
    return response.data;
  }
  async getExamTypes() {
    const response = await _axios.get(`/exam-types`);
    return response.data;
  }

  async editExam(examId: number, updates: EditableExam) {
    const response = await _axios.patch(`/exams/${examId}`, updates);
    return response.data;
  }

  async getPendingExams() {
    try{

      const response = await _axios.get<ExamesTypes[]>('/exams/pending');
      return response.data;
    }catch(error){
      ___showErrorToastNotification({
        message: "Erro inesperado ocorreu ao buscar os dados. Atualize a página ou contate o suporte."
      })
    }
  }

}

export const examRoutes = new ExamRoute();