"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, Filter, CalendarIcon, X, Users, Clock, DollarSign, CheckCircle, AlertCircle, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CompletedScheduleFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: Partial<CompletedScheduleFilters>) => void;
  onClearFilters: () => void;
  filters: CompletedScheduleFilters;
  totalSchedules: number;
  filteredCount: number;
}

export function CompletedScheduleFilters({
  onSearch,
  onFilterChange,
  onClearFilters,
  filters,
  totalSchedules,
  filteredCount
}: CompletedScheduleFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onSearch(value);
  };

  const handleFilterChange = (key: keyof CompletedScheduleFilters, value: any) => {
    onFilterChange({ [key]: value });
  };

  const hasActiveFilters = () => {
    return filters.dateFrom || filters.dateTo || filters.examStatus !== "TODOS" ||
      filters.paymentStatus !== "TODOS" || filters.technicianFilter !== "TODOS" || filters.searchQuery;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.examStatus !== "TODOS") count++;
    if (filters.paymentStatus !== "TODOS") count++;
    if (filters.technicianFilter !== "TODOS") count++;
    return count;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search and Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome do paciente, BI ou contacto..."
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>

              {hasActiveFilters() && (
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>
                Mostrando {filteredCount} de {totalSchedules} agendamentos
              </span>
            </div>
            {filters.searchQuery && (
              <Badge variant="outline">
                Busca: &quot;{filters.searchQuery}&quot;
              </Badge>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date From */}
                <div className="space-y-2">
                  <Label>Data inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? (
                          format(filters.dateFrom, "PPP", { locale: ptBR })
                        ) : (
                          "Selecionar data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date: Date) => handleFilterChange("dateFrom", date)}
                        disabled={(date: Date) => {
                          return date < new Date("2025-01-01");
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <Label>Data final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? (
                          format(filters.dateTo, "PPP", { locale: ptBR })
                        ) : (
                          "Selecionar data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date: Date) => handleFilterChange("dateTo", date)}
                        disabled={(date: Date) => {
                          if (date < new Date("1900-01-01")) {
                            return true;
                          }
                          if (filters.dateFrom && date < filters.dateFrom) {
                            return true;
                          }
                          return false;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Exam Status Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Status do Exame
                  </Label>
                  <Select
                    value={filters.examStatus}
                    onValueChange={(value) => handleFilterChange("examStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Status Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Status Pagamento
                  </Label>
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) => handleFilterChange("paymentStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="PAGO">Pago</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Technician Filter */}
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <Label className="flex items-center gap-1">
                    <UserCheck className="w-4 h-4" />
                    Técnico
                  </Label>
                  <Select
                    value={filters.technicianFilter}
                    onValueChange={(value) => handleFilterChange("technicianFilter", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar filtro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="ALOCADO">Com técnico alocado</SelectItem>
                      <SelectItem value="NAO_ALOCADO">Sem técnico alocado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Label className="text-sm font-medium text-gray-700">Filtros rápidos:</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange("examStatus", "PENDENTE")}
                  className="text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Exames Pendentes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange("paymentStatus", "PENDENTE")}
                  className="text-xs"
                >
                  <DollarSign className="w-3 h-3 mr-1" />
                  Pagamentos Pendentes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange("technicianFilter", "NAO_ALOCADO")}
                  className="text-xs"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Sem Técnico
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
