import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { _axios } from "@/Api/axios.config";
import { ___showErrorToastNotification, ___showSuccessToastNotification } from "@/lib/sonner";
import { usePatientPermissions } from "./usePatientPermissions";

export interface PatientFormData {
  nome_completo: string;
  numero_identificacao: string;
  id_sexo: number;
  data_nascimento: string;
  contacto_telefonico: string;
  sexo: {
    nome: string;
  };
}

export const usePatientForm = (
  patient: PatientType,
  refetchPatientInfo: () => void,
  userRole?: string
) => {
  const queryClient = useQueryClient();
  const { canEdit } = usePatientPermissions(userRole);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const today = new Date()

  const [formData, setFormData] = useState<PatientFormData>({
    nome_completo: patient.nome_completo,
    numero_identificacao: patient.numero_identificacao ?? "",
    id_sexo: patient.id_sexo,
    data_nascimento: patient.data_nascimento ?? "",
    contacto_telefonico: patient.contacto_telefonico ?? "",
    sexo: {
      nome: patient?.sexo?.nome ?? ""
    }
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nome_completo.trim()) {
      errors.nome_completo = "Nome completo é obrigatório";
    }

    if (!formData.numero_identificacao.trim()) {
      errors.numero_identificacao = "Número de identificação é obrigatório";
    }

    if (!formData.contacto_telefonico.trim()) {
      errors.contacto_telefonico = "Contacto telefônico é obrigatório";
    }

    if (!formData.data_nascimento) {
      errors.data_nascimento = "Data de nascimento é obrigatória";
    } else {
      const nascimentoDate = new Date(formData.data_nascimento);
      const today = new Date();
      if (nascimentoDate > today) {
        errors.data_nascimento = "A data de nascimento não pode ser futura";
      }
    }


    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpar erro específico quando o usuário começa a digitar
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      id_sexo: value === "Masculino" ? 1 : 2,
      sexo: { nome: value }
    }));
  };

  const updatePatient = useMutation({
    mutationFn: (data: Partial<PatientFormData>) => {
      if (!canEdit) {
        throw new Error("Você não tem permissão para editar informações de pacientes");
      }
      setIsSaving(true);
      return _axios.patch(`/pacients/${patient.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setIsSaving(false);
      setIsEditing(false);
      setValidationErrors({});
      ___showSuccessToastNotification({ message: "Dados atualizados com sucesso" });
      refetchPatientInfo();
    },
    onError: (error: any) => {
      setIsSaving(false);
      const errorMessage = error?.response?.data?.message || error.message || "Erro ao salvar dados";
      ___showErrorToastNotification({ message: errorMessage });
    },
  });

  const handleSave = () => {
    if (!canEdit) {
      ___showErrorToastNotification({ message: "Você não tem permissão para editar informações de pacientes" });
      return;
    }

    if (!validateForm()) {
      ___showErrorToastNotification({ message: "Por favor, corrija os erros no formulário" });
      return;
    }

    const dataToSend = {
      nome_completo: formData.nome_completo.trim(),
      numero_identificacao: formData.numero_identificacao.trim(),
      id_sexo: parseInt(formData.id_sexo.toString(), 10),
      data_nascimento: formData.data_nascimento,
      contacto_telefonico: formData.contacto_telefonico.trim(),
    };
    updatePatient.mutate(dataToSend);
  };

  const openEditDialog = () => {
    if (!canEdit) {
      ___showErrorToastNotification({ message: "Você não tem permissão para editar informações de pacientes" });
      return;
    }
    setIsEditing(true);
  };

  const closeEditDialog = () => {
    setIsEditing(false);
    setValidationErrors({});
    // Restaurar dados originais ao fechar
    setFormData({
      nome_completo: patient.nome_completo,
      numero_identificacao: patient.numero_identificacao ?? "",
      id_sexo: patient.id_sexo,
      data_nascimento: patient.data_nascimento ?? "",
      contacto_telefonico: patient.contacto_telefonico ?? "",
      sexo: {
        nome: patient?.sexo?.nome ?? ""
      }
    });
  };

  return {
    formData,
    isSaving,
    isEditing,
    validationErrors,
    canEdit,
    handleInputChange,
    handleGenderChange,
    handleSave,
    openEditDialog,
    closeEditDialog,
  };
};
