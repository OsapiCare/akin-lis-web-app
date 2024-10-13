import React, { useEffect, useState } from "react";
import { AutoComplete as PrimeAutoComplete, AutoCompleteProps } from "primereact/autocomplete";
import { FakeService } from "./service/fake-data";
import clsx from "clsx";
import "./index.css";
import { twMerge } from "tailwind-merge";

interface IInputData {
  value: string;
  id: string;
}

interface IAutoComplete extends AutoCompleteProps {
  dataFromServer: IInputData[];
  lookingFor: string;
}

export default function AutoComplete({ className, dataFromServer, lookingFor, ...rest }: IAutoComplete) {
  const [datas, setDatas] = useState<IInputData[]>([]);
  const [selectedDatas, setSelectedDatas] = useState(null);
  const [filteredDatas, setFilteredDatas] = useState<IInputData[]>([]);

  const panelFooterTemplate = () => {
    const isDatasSelected = (filteredDatas || []).some((patient) => patient["value"] === selectedDatas);
    return (
      <div className="py-2 px-3">
        {isDatasSelected ? (
          <span>
            <b>{selectedDatas}</b> Selecionado.
          </span>
        ) : (
          `Nenhum ${lookingFor} selecionado.`
        )}
      </div>
    );
  };

  const search = (event: any) => {
    // Timeout to emulate a network connection
    // setTimeout(() => {
    let _filteredData;

    if (!event.query.trim().length) {
      _filteredData = [...datas];
    } else {
      _filteredData = datas.filter((patient) => {
        return patient.value.toLowerCase().startsWith(event.query.toLowerCase());
      });
    }

    setFilteredDatas(_filteredData);
    // }, 250);
  };

  const itemTemplate = (item: IInputData) => {
    return (
      <div className="flex align-items-center">
        <img alt={item.value} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`flag flag-${item.id.toLowerCase()} mr-2`} style={{ width: "18px" }} />
        <div>{item.value}</div>
      </div>
    );
  };

  useEffect(() => {
    console.log(dataFromServer);
    
    setDatas(dataFromServer);
  }, []);

  return (
    <PrimeAutoComplete
      field="value"
      value={selectedDatas}
      suggestions={filteredDatas}
      completeMethod={search}
      onChange={(e) => setSelectedDatas(e.value)}
      itemTemplate={itemTemplate}
      panelFooterTemplate={panelFooterTemplate}
      className={twMerge("border-2 border-akin-yellow-light rounded-lg bg-akin-yellow-light/20 ring-0 ", className)}
      {...rest}
    />
  );
}
