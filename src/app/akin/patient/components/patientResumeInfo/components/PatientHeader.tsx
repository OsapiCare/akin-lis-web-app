import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Phone, MapPin, Edit3, Edit } from "lucide-react";
import { AvatarSection } from "../_avatarSection";

interface PersonalInfoItem {
  label: string;
  value: string;
  icon: string;
}

interface PatientHeaderProps {
  patient: PatientType;
  personalInfo: PersonalInfoItem[];
  canEdit: boolean;
  onEdit: () => void;
}

export function PatientHeader({ patient, personalInfo, canEdit, onEdit }: PatientHeaderProps) {
  const getIcon = (iconName: string) => {
    const icons = {
      user: <User className="w-4 h-4" />,
      "id-card": <User className="w-4 h-4" />,
      users: <User className="w-4 h-4" />,
      calendar: <Calendar className="w-4 h-4" />,
      clock: <Calendar className="w-4 h-4" />,
      phone: <Phone className="w-4 h-4" />,
    };
    return icons[iconName as keyof typeof icons] || <User className="w-4 h-4" />;
  };

  return (
    <Card className="w-full shadow-md border ">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <AvatarSection
              imageSrc="https://images.pexels.com/photos/12202417/pexels-photo-12202417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.nome_completo}
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 border-green-300"
                >
                  Ativo
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>ID: {patient.numero_identificacao}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Última visita: {patient.data_ultima_visita ?? new Date(patient.data_ultima_visita).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </div>

          {canEdit && (
            <Button
              onClick={onEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 hover:shadow-lg"
              size="lg"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalInfo.map((info, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-200/50 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {getIcon(info.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {info.label}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {info.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
