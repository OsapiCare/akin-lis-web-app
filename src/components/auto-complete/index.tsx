import React, { useEffect, useState } from "react";
import { AutoComplete as PrimeAutoComplete } from "primereact/autocomplete";
import { FakeService } from "./service/fake-data";

interface ICountry {
  name: string;
  code: string;
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

export default function AutoComplete() {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [filteredCountries, setFilteredCountries] = useState<ICountry[]>([]);

  const panelFooterTemplate = () => {
    const isCountrySelected = (filteredCountries || []).some((country) => country["name"] === selectedCountry);
    return (
      <div className="py-2 px-3">
        {isCountrySelected ? (
          <span>
            <b>{selectedCountry}</b> selected.
          </span>
        ) : (
          "No country selected."
        )}
      </div>
    );
  };

  const search = (event: any) => {
    // Timeout to emulate a network connection
    setTimeout(() => {
      let _filteredCountries;

      if (!event.query.trim().length) {
        _filteredCountries = [...countries];
      } else {
        _filteredCountries = countries.filter((country) => {
          return country.name.toLowerCase().startsWith(event.query.toLowerCase());
        });
      }

      setFilteredCountries(_filteredCountries);
    }, 250);
  };

  const itemTemplate = (item: ICountry) => {
    return (
      <div className="flex align-items-center">
        <img alt={item.name} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`flag flag-${item.code.toLowerCase()} mr-2`} style={{ width: "18px" }} />
        <div>{item.name}</div>
      </div>
    );
  };

  useEffect(() => {
    FakeService.getCountries().then((data) => setCountries(data));
  }, []);

  return (
    <div className="card flex justify-content-center">
      <PrimeAutoComplete field="name" value={selectedCountry} suggestions={filteredCountries} completeMethod={search} onChange={(e) => setSelectedCountry(e.value)} itemTemplate={itemTemplate} panelFooterTemplate={panelFooterTemplate} />
    </div>
  );
}
