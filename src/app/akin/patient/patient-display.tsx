"use client";

import { useState } from "react";
import { ListMode } from "./components/listModePatients";
import { BlockMode } from "./components/blockModePatients";
import { GridOrBlockDisplayButton } from "./components/gridOrBlockButtonMode";
import { Input } from "@/components/ui/input";
import { ModalNewPatient } from "../schedule/new/components/ModalNewPatient";
import { getAllDataInCookies } from "@/utils/get-data-in-cookies";

interface PatientDisplay {
  patients: PatientType[];
}

export default function PatientDisplay({ patients }: PatientDisplay) {
  const [filteredPatients, setFilteredPatients] = useState<PatientType[]>(patients);
  const [allPatients, setAllPatients] = useState<PatientType[]>(patients);
  const [isSearching, setIsSearching] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("list");
  const recepcionista = "RECEPCIONISTA";

  function handleSearch(searchText: string) {
    setIsSearching(searchText?.length > 0);

    const foundPatients = allPatients.filter((patient) =>
      patient.nome_completo.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredPatients(foundPatients);
  }

  const handlePatientSaved = (newPatient: PatientType) => {
    // Adiciona o novo paciente à lista completa
    const updatedPatients = [...allPatients, newPatient];
    setAllPatients(updatedPatients);

    // Atualiza a lista filtrada também
    setFilteredPatients(updatedPatients);

    // Se estava pesquisando, aplica o filtro novamente
    if (isSearching) {
      const searchInput = document.querySelector('input[placeholder="Procurar por nome"]') as HTMLInputElement;
      if (searchInput && searchInput.value) {
        handleSearch(searchInput.value);
      }
    }
  };

  return (
    <div className=" px-6 pt-4 pb-6 shadow-sm rounded-lg">
      {/* Barra de controle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Botão de alternância */}
        <div className="mb-4 sm:mb-0">
          <GridOrBlockDisplayButton
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
            isGrid
          />
        </div>

        {/* Botão Cadastrar Paciente e Campo de busca */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">

          {
            recepcionista === getAllDataInCookies().userRole ? (
              <div className="flex justify-end">
                <ModalNewPatient onPatientSaved={handlePatientSaved} />
              </div>
            ): null
          }

          {/* Campo de busca */}
          <div className="w-full sm:w-96">
            <Input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus-visible:ring-0"
              placeholder="Procurar por nome"
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isSearching && (
              <p className="mt-2 text-sm text-gray-600 italic">
                {filteredPatients?.length > 0
                  ? `Total de pacientes encontrados: ${filteredPatients.length}`
                  : "Nenhum paciente encontrado"}
              </p>
            )}
          </div>
        </div>
      </div>
      {
        filteredPatients?.length > 0 ? (
          <>
            {displayMode === "list" && <ListMode patientList={filteredPatients} />}
            {displayMode === "block" && <BlockMode patientList={filteredPatients} />}
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500">
              Nenhum paciente encontrado.
            </p>
          </div>
        )
      }
    </div>
  );
}
