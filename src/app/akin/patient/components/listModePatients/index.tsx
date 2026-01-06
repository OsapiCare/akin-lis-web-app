import { useState } from "react";
import { APP_CONFIG } from "@/components/layout/app";
import Link from "next/link";
import { getAgeText } from "@/utils/get-yearUser";

const ITEMS_PER_PAGE = 10;

export function ListMode({ patientList }: { patientList: PatientType[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const date = new Date();

  const totalItems = patientList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPatients = patientList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-lg font-medium text-gray-700">Lista de Pacientes</h2>
      </div>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        {/* Cabeçalho */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">Nome do Paciente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">Nº do BI</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">Idade</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">Data de Nascimento</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">Contacto</th>
            <th className="px-4 py-3 text-right"></th>
          </tr>
        </thead>
        {/* Corpo */}
        <tbody className="divide-y divide-gray-100">
          {currentPatients.map((patient, index) => (
            <tr
              key={index}
              className="even:bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
            >
              <td className="px-4 py-3 text-gray-700">{patient.nome_completo}</td>
              <td className="px-4 py-3 text-gray-700">{patient.numero_identificacao}</td>
              <td className="px-4 py-3 text-gray-700">
                {getAgeText(patient?.data_nascimento ?? "")}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {new Date(patient?.data_nascimento ?? "").toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-gray-700">{patient.contacto_telefonico}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={APP_CONFIG.ROUTES.PATIENT.INDIVIDUAL_PATIENT_LINK(patient.id)}
                  className="inline-block rounded bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  aria-label={`Ver detalhes de ${patient.nome_completo}`}
                >
                  Ver Paciente
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t">
        <span className="text-sm text-gray-600">
          Exibindo {startIndex + 1} -{" "}
          {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} de {totalItems} pacientes
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`px-3 py-1 text-sm font-medium border rounded ${currentPage === idx + 1
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
              onClick={() => handlePageChange(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}
