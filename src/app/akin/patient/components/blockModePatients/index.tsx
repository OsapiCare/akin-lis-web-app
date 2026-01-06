import { useState } from "react";
import { APP_CONFIG } from "@/components/layout/app";
import Link from "next/link";
import Image from "next/image";
import { getAgeText } from "@/utils/get-yearUser";

const ITEMS_PER_PAGE = 6;

export function BlockMode({ patientList }: { patientList: PatientType[] }) {
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
    <div className="min-w-full bg-white text-sm">
      {/* Grid de Pacientes */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 p-4">
        {currentPatients.map((patient, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {/* Imagem e Nome */}
            <div className="relative h-48 bg-gray-100">
              <Image
                className="object-cover"
                src="/images/patient.webp"
                fill
                alt={`Foto de ${patient.nome_completo}`}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-lg font-semibold text-white">{patient.nome_completo}</h3>
              </div>
            </div>

            {/* Detalhes do Paciente */}
            <div className="p-4 space-y-2">
              <p className="text-gray-700">
                <strong className="font-medium">Nº do BI:</strong> {patient.numero_identificacao}
              </p>
              <p className="text-gray-700">
                <strong className="font-medium">Idade:</strong>{" "}
                {getAgeText(patient?.data_nascimento ?? "")}
              </p>
              <p className="text-gray-700">
                <strong className="font-medium">Data de Nascimento:</strong>{" "}
                {new Date(patient?.data_nascimento ?? "").toLocaleDateString()}
              </p>
              <p className="text-gray-700">
                <strong className="font-medium">Contacto:</strong> {patient.contacto_telefonico}
              </p>
            </div>

            {/* Botão */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <Link
                href={APP_CONFIG.ROUTES.PATIENT.INDIVIDUAL_PATIENT_LINK(patient.id)}
                className="block w-full rounded bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Ver Paciente
              </Link>
            </div>
          </div>
        ))}
      </div>

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
