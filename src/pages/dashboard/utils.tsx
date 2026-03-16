import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { BenefitStatus } from "../../types";

export const getStatusColor = (status?: BenefitStatus): string => {
    switch(status) {
        case 'Finalizado': return 'bg-emerald-500';
        case 'Em Andamento': return 'bg-blue-500';
        default: return 'bg-amber-400';
    }
};

export const getStatusBg = (status?: BenefitStatus): string => {
    switch(status) {
        case 'Finalizado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'Em Andamento': return 'bg-blue-50 text-blue-700 border-blue-200';
        default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
};

export const getStatusIcon = (status?: BenefitStatus) => {
    switch(status) {
        case 'Finalizado': return <CheckCircle size={14} className="text-emerald-600" />;
        case 'Em Andamento': return <Clock size={14} className="text-blue-600" />;
        default: return <AlertCircle size={14} className="text-amber-600" />;
    }
};
