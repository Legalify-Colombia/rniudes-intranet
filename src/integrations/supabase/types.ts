export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      archivos_estudiante: {
        Row: {
          created_at: string | null
          estudiante_id: string
          filename: string
          id: string
          path: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estudiante_id: string
          filename: string
          id?: string
          path: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estudiante_id?: string
          filename?: string
          id?: string
          path?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archivos_estudiante_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["id"]
          },
        ]
      }
      asignacion_beca: {
        Row: {
          calidad_academica: number | null
          ensayo_motivacion: number | null
          estudiante_id: string
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          id: string
          importancia_paises: number | null
          nivel_ingles: number | null
          pertinencia_programa: number | null
          puntaje_total: number | null
          semillero_mentorias: number | null
          valor_beca: string | null
        }
        Insert: {
          calidad_academica?: number | null
          ensayo_motivacion?: number | null
          estudiante_id: string
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id?: string
          importancia_paises?: number | null
          nivel_ingles?: number | null
          pertinencia_programa?: number | null
          puntaje_total?: number | null
          semillero_mentorias?: number | null
          valor_beca?: string | null
        }
        Update: {
          calidad_academica?: number | null
          ensayo_motivacion?: number | null
          estudiante_id?: string
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id?: string
          importancia_paises?: number | null
          nivel_ingles?: number | null
          pertinencia_programa?: number | null
          puntaje_total?: number | null
          semillero_mentorias?: number | null
          valor_beca?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asignacion_beca_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["id"]
          },
        ]
      }
      convocatorias: {
        Row: {
          codigo: string
          created_at: string | null
          estado: string
          fecha_inicio: string
          fecha_limite_inscripcion: string
          id: string
          periodo: string
          updated_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          estado: string
          fecha_inicio: string
          fecha_limite_inscripcion: string
          id?: string
          periodo: string
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          estado?: string
          fecha_inicio?: string
          fecha_limite_inscripcion?: string
          id?: string
          periodo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      criterios_movilidad: {
        Row: {
          Aceptación_de_terminos: boolean | null
          Certificado_de_Notas: boolean | null
          Certificado_Idiomas: boolean | null
          estudiante_id: string
          fecha_actualizacion: string
          fecha_creacion: string
          HV: boolean | null
          id: string
          motivación: boolean | null
          "Nivel de Ingles": string | null
          nombre_semillero: string | null
          Pasaporte: boolean | null
          semillero_investigacion: boolean
          validacion_semillero: string
        }
        Insert: {
          Aceptación_de_terminos?: boolean | null
          Certificado_de_Notas?: boolean | null
          Certificado_Idiomas?: boolean | null
          estudiante_id: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          HV?: boolean | null
          id?: string
          motivación?: boolean | null
          "Nivel de Ingles"?: string | null
          nombre_semillero?: string | null
          Pasaporte?: boolean | null
          semillero_investigacion?: boolean
          validacion_semillero?: string
        }
        Update: {
          Aceptación_de_terminos?: boolean | null
          Certificado_de_Notas?: boolean | null
          Certificado_Idiomas?: boolean | null
          estudiante_id?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          HV?: boolean | null
          id?: string
          motivación?: boolean | null
          "Nivel de Ingles"?: string | null
          nombre_semillero?: string | null
          Pasaporte?: boolean | null
          semillero_investigacion?: boolean
          validacion_semillero?: string
        }
        Relationships: [
          {
            foreignKeyName: "criterios_movilidad_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["id"]
          },
        ]
      }
      encuestas_seguimiento: {
        Row: {
          estado: string
          fecha: string
          id: string
          movilidad_id: string
          observaciones: string | null
          respuestas: Json
          tipo: string
        }
        Insert: {
          estado: string
          fecha?: string
          id?: string
          movilidad_id: string
          observaciones?: string | null
          respuestas?: Json
          tipo: string
        }
        Update: {
          estado?: string
          fecha?: string
          id?: string
          movilidad_id?: string
          observaciones?: string | null
          respuestas?: Json
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "encuestas_seguimiento_movilidad_id_fkey"
            columns: ["movilidad_id"]
            isOneToOne: false
            referencedRelation: "movilidades"
            referencedColumns: ["id"]
          },
        ]
      }
      estudiantes: {
        Row: {
          acudiente_direccion: string | null
          acudiente_email: string | null
          acudiente_nombre: string | null
          acudiente_parentesco: string | null
          acudiente_telefono: string | null
          campus: string
          celular: string
          codigo: string
          email: string
          facultad: string
          fecha_registro: string | null
          id: string
          motivacion: string | null
          naturaleza_inscripcion: string | null
          nombre: string
          numero_documento: string
          programa_academico: string
          promedio: number
          semestre_actual: number
          tipo_documento: string
          tipo_movilidad: string | null
        }
        Insert: {
          acudiente_direccion?: string | null
          acudiente_email?: string | null
          acudiente_nombre?: string | null
          acudiente_parentesco?: string | null
          acudiente_telefono?: string | null
          campus: string
          celular: string
          codigo: string
          email: string
          facultad: string
          fecha_registro?: string | null
          id?: string
          motivacion?: string | null
          naturaleza_inscripcion?: string | null
          nombre: string
          numero_documento: string
          programa_academico: string
          promedio: number
          semestre_actual: number
          tipo_documento: string
          tipo_movilidad?: string | null
        }
        Update: {
          acudiente_direccion?: string | null
          acudiente_email?: string | null
          acudiente_nombre?: string | null
          acudiente_parentesco?: string | null
          acudiente_telefono?: string | null
          campus?: string
          celular?: string
          codigo?: string
          email?: string
          facultad?: string
          fecha_registro?: string | null
          id?: string
          motivacion?: string | null
          naturaleza_inscripcion?: string | null
          nombre?: string
          numero_documento?: string
          programa_academico?: string
          promedio?: number
          semestre_actual?: number
          tipo_documento?: string
          tipo_movilidad?: string | null
        }
        Relationships: []
      }
      eventos_timeline: {
        Row: {
          estado: string
          fecha: string
          id: string
          observacion: string | null
          postulacion_id: string
          usuario_id: string | null
        }
        Insert: {
          estado: string
          fecha: string
          id?: string
          observacion?: string | null
          postulacion_id: string
          usuario_id?: string | null
        }
        Update: {
          estado?: string
          fecha?: string
          id?: string
          observacion?: string | null
          postulacion_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_timeline_postulacion_id_fkey"
            columns: ["postulacion_id"]
            isOneToOne: false
            referencedRelation: "postulaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      movilidades: {
        Row: {
          aerolinea: string | null
          created_at: string | null
          estado: string
          estado_visado: string | null
          fecha_regreso: string | null
          fecha_viaje: string | null
          id: string
          numero_vuelo: string | null
          postulacion_id: string
          updated_at: string | null
        }
        Insert: {
          aerolinea?: string | null
          created_at?: string | null
          estado?: string
          estado_visado?: string | null
          fecha_regreso?: string | null
          fecha_viaje?: string | null
          id?: string
          numero_vuelo?: string | null
          postulacion_id: string
          updated_at?: string | null
        }
        Update: {
          aerolinea?: string | null
          created_at?: string | null
          estado?: string
          estado_visado?: string | null
          fecha_regreso?: string | null
          fecha_viaje?: string | null
          id?: string
          numero_vuelo?: string | null
          postulacion_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movilidades_postulacion_id_fkey"
            columns: ["postulacion_id"]
            isOneToOne: false
            referencedRelation: "postulaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      postulaciones: {
        Row: {
          codigo_participacion: string | null
          convocatoria_id: string | null
          estado_actual: string
          estudiante_id: string
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_fin_movilidad: string | null
          fecha_inicio_movilidad: string | null
          id: string
          naturaleza_inscripcion: string
          pais_destino: string
          prioridad: number
          tipo_beca: string | null
          tipo_movilidad: string
          universidad_destino: string
        }
        Insert: {
          codigo_participacion?: string | null
          convocatoria_id?: string | null
          estado_actual: string
          estudiante_id: string
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_fin_movilidad?: string | null
          fecha_inicio_movilidad?: string | null
          id?: string
          naturaleza_inscripcion: string
          pais_destino: string
          prioridad: number
          tipo_beca?: string | null
          tipo_movilidad: string
          universidad_destino: string
        }
        Update: {
          codigo_participacion?: string | null
          convocatoria_id?: string | null
          estado_actual?: string
          estudiante_id?: string
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_fin_movilidad?: string | null
          fecha_inicio_movilidad?: string | null
          id?: string
          naturaleza_inscripcion?: string
          pais_destino?: string
          prioridad?: number
          tipo_beca?: string | null
          tipo_movilidad?: string
          universidad_destino?: string
        }
        Relationships: [
          {
            foreignKeyName: "postulaciones_convocatoria_id_fkey"
            columns: ["convocatoria_id"]
            isOneToOne: false
            referencedRelation: "convocatorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulaciones_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulaciones_universidad_destino_fkey"
            columns: ["universidad_destino"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      universidades: {
        Row: {
          ciudad: string
          convenio_activo: boolean
          created_at: string | null
          id: string
          nombre: string
          pais: string
          sitio_web: string | null
        }
        Insert: {
          ciudad: string
          convenio_activo?: boolean
          created_at?: string | null
          id?: string
          nombre: string
          pais: string
          sitio_web?: string | null
        }
        Update: {
          ciudad?: string
          convenio_activo?: boolean
          created_at?: string | null
          id?: string
          nombre?: string
          pais?: string
          sitio_web?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          campus: string
          created_at: string | null
          email: string
          id: string
          nombre: string
          role: string
          telefono: string | null
        }
        Insert: {
          campus: string
          created_at?: string | null
          email: string
          id: string
          nombre: string
          role?: string
          telefono?: string | null
        }
        Update: {
          campus?: string
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          role?: string
          telefono?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
