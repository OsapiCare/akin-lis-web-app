import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClockArrowDown, AlertCircle } from "lucide-react";

interface TimePickerProps {
  value?: string; // Hora inicial no formato "HH:mm"
  onChange?: (time: string) => void; // Callback para retornar o horário selecionado
  isToday?: boolean; // Se a data selecionada é hoje
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, isToday = false }) => {
  const [selectedHour, setSelectedHour] = useState<string>(value?.split(":")[0] || "00");
  const [selectedMinute, setSelectedMinute] = useState<string>(value?.split(":")[1] || "00");
  const [isValidTime, setIsValidTime] = useState<boolean>(true);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Obtém a hora atual
  const getCurrentTime = () => {
    const now = new Date();
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
    };
  };

  // Verifica se o horário selecionado é válido para hoje
  const validateTimeForToday = (hour: string, minute: string): boolean => {
    if (!isToday) return true;

    const currentTime = getCurrentTime();
    const selectedHourNum = parseInt(hour, 10);
    const selectedMinuteNum = parseInt(minute, 10);

    // Verifica se o horário é anterior ao atual
    if (selectedHourNum < currentTime.hours || (selectedHourNum === currentTime.hours && selectedMinuteNum <= currentTime.minutes)) {
      return false;
    }

    return true;
  };

  const handleChange = (hour: string, minute: string) => {
    const time = `${hour}:${minute}`;

    // Valida se for hoje
    if (isToday) {
      const isValid = validateTimeForToday(hour, minute);
      setIsValidTime(isValid);

      if (!isValid) {
        const currentTime = getCurrentTime();
        setTimeError(`Para hoje, selecione um horário após ${currentTime.hours.toString().padStart(2, "0")}:${currentTime.minutes.toString().padStart(2, "0")}`);
      } else {
        setTimeError(null);
      }
    } else {
      setIsValidTime(true);
      setTimeError(null);
    }

    onChange?.(time);
  };

  useEffect(() => {
    // Se não for hoje, sempre válido
    if (!isToday) {
      setIsValidTime(true);
      setTimeError(null);
      return;
    }

    if (value) {
      const isValid = validateTimeForToday(selectedHour, selectedMinute);
      setIsValidTime(isValid);

      if (!isValid) {
        const currentTime = getCurrentTime();
        setTimeError(`Horário inválido para hoje. Hora atual: ${currentTime.hours.toString().padStart(2, "0")}:${currentTime.minutes.toString().padStart(2, "0")}`);
      } else {
        setTimeError(null);
      }
    }
  }, [isToday, value, selectedHour, selectedMinute]);

  // Filtra horas válidas se for hoje
  const getValidHours = () => {
    if (!isToday) {
      return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
    }

    const currentTime = getCurrentTime();
    const validHours = [];

    for (let i = currentTime.hours + 1; i < 24; i++) {
      validHours.push(i.toString().padStart(2, "0"));
    }

    // Adiciona a hora atual apenas se ainda houver minutos disponíveis
    if (parseInt(selectedHour, 10) === currentTime.hours) {
      validHours.unshift(currentTime.hours.toString().padStart(2, "0"));
    }

    return validHours;
  };

  // Filtra minutos válidos se for hoje e for a hora atual
  const getValidMinutes = (hour: string) => {
    if (!isToday || parseInt(hour, 10) > getCurrentTime().hours) {
      return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
    }

    const currentTime = getCurrentTime();
    const validMinutes = [];

    // Se for a hora atual, só permite minutos futuros
    if (parseInt(hour, 10) === currentTime.hours) {
      for (let i = currentTime.minutes + 1; i < 60; i++) {
        validMinutes.push(i.toString().padStart(2, "0"));
      }
    } else {
      // Para outras horas, todos os minutos são válidos
      return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
    }

    return validMinutes;
  };

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={`py-2 w-full bg-white border rounded-md shadow-sm text-gray-900 hover:bg-gray-200 focus:ring-2 flex justify-between items-center px-4 ${
              !isValidTime ? "border-red-300 hover:border-red-400 focus:ring-red-500" : "border-gray-300 hover:border-gray-400 focus:ring-blue-500"
            }`}
          >
            <span className={!isValidTime ? "text-red-600" : ""}>{`${selectedHour}:${selectedMinute}`}</span>
            <ClockArrowDown size={18} className={!isValidTime ? "text-red-600" : "text-gray-800"} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="flex space-x-4 p-4">
          {/* Selector for Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
            <Select
              onValueChange={(value) => {
                setSelectedHour(value);
                handleChange(value, selectedMinute);
              }}
              defaultValue={selectedHour}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {getValidHours().map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector for Minutes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minuto</label>
            <Select
              onValueChange={(value) => {
                setSelectedMinute(value);
                handleChange(selectedHour, value);
              }}
              defaultValue={selectedMinute}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {getValidMinutes(selectedHour).map((minute) => (
                  <SelectItem key={minute} value={minute}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>

      {timeError && !isValidTime && (
        <div className="flex items-start gap-1">
          <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-500">{timeError}</p>
        </div>
      )}

      {isToday && isValidTime && !timeError && <p className="text-xs text-gray-500">Horário válido para hoje</p>}
    </div>
  );
};

export default TimePicker;
