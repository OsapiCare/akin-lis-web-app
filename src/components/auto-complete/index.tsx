import React, { useEffect, useState } from "react";
import { AutoComplete as PrimeAutoComplete, AutoCompleteProps } from "primereact/autocomplete";
import { FakeService } from "./service/fake-data";
import clsx from "clsx";
import "./index.css";
import { twMerge } from "tailwind-merge";

interface IPatients {
  value: string;
  id: string;
}

interface IAutoComplete {
  //   field: string;
  //   value: string;
  //   suggestions: ICountry[];
  //   completeMethod: (event: any) => void;
  //   onChange: (event: any) => void;
  //   itemTemplate: (item: ICountry) => React.ReactNode;
  //   panelFooterTemplate: () => React.ReactNode;
}

interface IAutoComplete extends AutoCompleteProps {}

export default function AutoComplete({ className, ...rest }: IAutoComplete) {
  const [patients, setPatients] = useState<IPatients[]>([]);
  const [selectedPatients, setSelectedPatients] = useState(null);
  const [filteredPatients, setFilteredPatients] = useState<IPatients[]>([]);

  const panelFooterTemplate = () => {
    const isPatientsSelected = (filteredPatients || []).some((patient) => patient["value"] === selectedPatients);
    return (
      <div className="py-2 px-3">
        {isPatientsSelected ? (
          <span>
            <b>{selectedPatients}</b> Selecionado.
          </span>
        ) : (
          "Nenhum paciente selecionado."
        )}
      </div>
    );
  };

  const search = (event: any) => {
    // Timeout to emulate a network connection
    setTimeout(() => {
      let _filteredCountries;

      if (!event.query.trim().length) {
        _filteredCountries = [...patients];
      } else {
        _filteredCountries = patients.filter((patient) => {
          return patient.value.toLowerCase().startsWith(event.query.toLowerCase());
        });
      }

      setFilteredPatients(_filteredCountries);
    }, 250);
  };

  const itemTemplate = (item: IPatients) => {
    return (
      <div className="flex align-items-center">
        <img alt={item.value} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`flag flag-${item.id.toLowerCase()} mr-2`} style={{ width: "18px" }} />
        <div>{item.value}</div>
      </div>
    );
  };

  useEffect(() => {
    FakeService.getCountries().then((data) => setPatients(data));
  }, []);

  return (
    <PrimeAutoComplete
      field="value"
      value={selectedPatients}
      suggestions={filteredPatients}
      completeMethod={search}
      onChange={(e) => setSelectedPatients(e.value)}
      itemTemplate={itemTemplate}
      panelFooterTemplate={panelFooterTemplate}
      className={twMerge("border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0 ", className)}
      {...rest}
    />
  );
}
