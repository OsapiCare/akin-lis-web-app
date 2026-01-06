import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, Clock, TrendingUp } from "lucide-react";

interface PatientStatsProps {
  patient: PatientType;
  totalExams?: number;
  pendingExams?: number;
}

export function PatientStats({ patient, totalExams = 0, pendingExams = 0 }: PatientStatsProps) {
  const calculateDaysSinceLastVisit = (date: string) => {
    if (!date) return 0; // Retorna 0 se a data não estiver definida
    const lastVisit = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateDaysSinceRegistration = (date: string) => {
    const registration = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - registration.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceLastVisit = patient.dias_desde_ultima_visita;
  const dateSinceLastVisit = calculateDaysSinceLastVisit(patient?.data_ultima_visita ?? "");
  const daysSinceRegistration = calculateDaysSinceRegistration(patient.criado_aos.toString());

  const stats = [
    {
      title: "Total de Exames",
      value: totalExams,
      icon: <Activity className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600",
      bgColor: "bg-blue-50/50"
    },
    {
      title: "Exames Pendentes",
      value: pendingExams,
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-orange-100 text-orange-600",
      bgColor: "bg-orange-50/50"
    },
    {
      title: "Dias desde última visita",
      value: daysSinceLastVisit,
      icon: <Clock className="w-5 h-5" />,
      color: "bg-green-100 text-green-600",
      bgColor: "bg-green-50/50"
    },
    {
      title: "Dias como paciente",
      value: daysSinceRegistration,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-600",
      bgColor: "bg-purple-50/50"
    }
  ];

  return (
    <Card className="w-full shadow-md border bg-gradient-to-br from-gray-50 to-gray-50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Estatísticas Rápidas
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${stat.bgColor} border border-gray-200/50 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status do Paciente</span>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 border-green-300"
            >
              Ativo
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">Data de Registro</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(patient.criado_aos).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
