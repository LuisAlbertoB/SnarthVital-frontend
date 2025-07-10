export interface WebSocketMessage {
    topic?: string;
    data?: any;
    type?: string;
    patient_id?: number;
    doctor_id?: number;
    alertas?: string[];
}
  