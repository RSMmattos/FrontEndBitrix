
export interface BitrixTask {
  ID: string;
  TITLE: string;
  DESCRIPTION: string;
  PRIORITY: string;
  STATUS: string;
  CREATED_DATE: string;
  DEADLINE: string | null;
  CLOSED_DATE: string | null;
  RESPONSIBLE_ID: string;
  RESPONSIBLE_NAME?: string;
  PARENT_ID: string | null;
  GROUP_NAME?: string;
  AUDITORS?: string[]; // Nomes dos observadores
  TASK_TYPE?: 'MÃE' | 'FILHA' | 'NORMAL';
  COMMENT?: string; 
  // Campos extras da integração batividadeg
  batividadeg_prioridade?: boolean;
  batividadeg_comentario?: string;
  batividadeg_dataprazofinal?: string;
}

export enum TaskPriority {
  LOW = "0",
  NORMAL = "1",
  HIGH = "2"
}

export enum TaskStatus {
  NEW = "1",
  PENDING = "2",
  IN_PROGRESS = "3",
  SUPPOSEDLY_COMPLETED = "4",
  COMPLETED = "5",
  DEFERRED = "6",
  DECLINED = "7"
}

export interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  nome_usuario?: string;
  codperfil?: number;
  codusuario?: string;
  ativo?: boolean | number;
}

export interface CostCenter {
  codccusto: string;
  nome: string;
  ativo: boolean | number;
}

export interface GroupLink {
  codccusto: string;
  idtask: number;
}

export interface BitrixGroup {
  ID: string;
  NAME: string;
}
