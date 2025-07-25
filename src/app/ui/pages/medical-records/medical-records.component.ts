import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { User } from '../../../features/user/models/user';
import { AuthService } from '../../../auth/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Record } from '../../../features/medicalRecord/models/record';
import { MedicalRecordService } from '../../../features/medicalRecord/medical-record.service';
import { PdfGeneratorService } from '../../../features/medicalRecord/pdf-generator.service';
import { EmailService } from '../../../features/medicalRecord/email.service';
import { UserService } from '../../../features/user/user.service';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextarea } from 'primeng/inputtextarea';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    InputTextModule,
    TableModule,
    ButtonModule,
    FormsModule,
    DatePickerModule,
    SelectModule,
    TooltipModule,
    RouterModule,
    DialogModule,
    ToastModule,
    InputTextarea
  ],
  providers: [MessageService],
  templateUrl: './medical-records.component.html',
  styleUrl: './medical-records.component.css'
})
export class MedicalRecordsComponent implements OnInit {
  currentUser!: User;
  patients: User[] = [];
  records: Record[] = [];
  rangeDates: Date[] | undefined;
  selectedPatient: User | undefined;
  recordNumber: string = '';
  patientOptions: any[] = [];
  downloadingRecords: Set<number> = new Set();

  // Variables para el diálogo de correo
  showEmailDialog: boolean = false;
  emailDestination: string = '';
  customMessage: string = '';
  selectedRecordId: number | null = null;
  sendingEmail: boolean = false;
  selectedDestinationType: string = 'doctor';
  destinationOptions: any[] = [];
  customEmail: string = '';

  constructor(
    private authService: AuthService,
    private recordService: MedicalRecordService,
    private pdfGenerator: PdfGeneratorService,
    private emailService: EmailService,
    private userService: UserService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (this.authService.getUser()) {
      this.currentUser = this.authService.getUser() as User;
    }
    this.getRecords();
    if (this.currentUser.role === 'doctor') {
      this.loadPatients();
    }
  }

  loadPatients(): void {
    if (!this.currentUser.id) {
      console.error('Doctor ID is not available');
      return;
    }
    this.userService.getPatients(this.currentUser.id).subscribe({
      next: (data) => {
        this.patients = data;
        this.patientOptions = data.map(patient => ({
          label: `${patient.name} ${patient.lastname}`,
          value: patient
        }));
      },
      error: (error) => {
        console.error('Error fetching patients:', error);
      }
    });
  }

  getRecords(): Record[] {
    if (!this.currentUser.id) {
      console.error('Doctor ID is not available');
      return [];
    }
    if (this.currentUser.role === 'doctor') {
      this.recordService.getDoctorMedicalRecords(this.currentUser.id).subscribe({
        next: (data) => {
          this.records = data;
        },
        error: (error) => {
          console.error('Error fetching doctor medical records:', error);
        }
      });
    } else if (this.currentUser.role === 'patient') {
      this.recordService.getPatientMedicalRecords(this.currentUser.id).subscribe({
        next: (data) => {
          this.records = data;
        },
        error: (error) => {
          console.error('Error fetching patient medical records:', error);
        }
      });
    }
    return this.records;
  }

  getPatients(): User[] {
    return this.patients;
  }

  applyFilters(): void {
    // Si hay al menos una fecha seleccionada
    if (this.rangeDates && this.rangeDates.length > 0 && this.rangeDates[0]) {
      // Si solo hay una fecha, usa la misma para inicio y fin
      const startDate = this.rangeDates[0].toISOString().split('T')[0];
      const endDate = (this.rangeDates[1] ? this.rangeDates[1] : this.rangeDates[0]).toISOString().split('T')[0];

      if (this.currentUser.role === 'doctor') {
        const doctorId = this.currentUser.id!;
        let patientId = this.selectedPatient?.id!;

        if (patientId) {
          this.recordService.getPatientMedicalRecordsByRange(patientId, startDate, endDate).subscribe({
            next: (data) => {
              this.records = this.filterByRecordNumber(data);
            },
            error: (error) => {
              console.error('Error filtrando por paciente y rango:', error);
            }
          });
        } else {
          this.recordService.getDoctorMedicalRecordsByRange(doctorId, startDate, endDate).subscribe({
            next: (data) => {
              this.records = this.filterByRecordNumber(data);
            },
            error: (error) => {
              console.error('Error filtrando por doctor y rango:', error);
            }
          });
        }
      } else if (this.currentUser.role === 'patient') {
        const patientId = this.currentUser.id!;
        this.recordService.getPatientMedicalRecordsByRange(patientId, startDate, endDate).subscribe({
          next: (data) => {
            this.records = this.filterByRecordNumber(data);
          },
          error: (error) => {
            console.error('Error filtrando por paciente y rango:', error);
          }
        });
      }
    } else if (this.recordNumber) {
      this.records = this.filterByRecordNumber(this.records);
    } else {
      this.getRecords();
    }
  }

  // Método auxiliar para filtrar por número de expediente
  filterByRecordNumber(records: Record[]): Record[] {
    if (!this.recordNumber) return records;
    return records.filter(record => record.id.toString().includes(this.recordNumber));
  }

  async downloadRecordPDF(recordId: number): Promise<void> {
    this.downloadingRecords.add(recordId);

    try {
      // Obtener el record completo con riesgos
      this.recordService.getMedicalRecordWithRisks(recordId).subscribe({
        next: async (recordWithRisks) => {
          try {
            await this.pdfGenerator.generateRecordPDF(recordWithRisks);
          } catch (error) {
            console.error('Error generating PDF:', error);
          } finally {
            this.downloadingRecords.delete(recordId);
          }
        },
        error: (error) => {
          console.error('Error fetching record:', error);
          this.downloadingRecords.delete(recordId);
        }
      });
    } catch (error) {
      console.error('Error in downloadRecordPDF:', error);
      this.downloadingRecords.delete(recordId);
    }
  }

  isDownloading(recordId: number): boolean {
    return this.downloadingRecords.has(recordId);
  }

  openEmailDialog(recordId: number): void {
    this.selectedRecordId = recordId;
    this.emailDestination = '';
    this.customMessage = '';
    this.selectedDestinationType = 'doctor';
    this.customEmail = '';

    // Configurar opciones de destinatarios
    this.destinationOptions = [];
    const record = this.records.find(r => r.id === recordId);

    if (record) {
      if (this.currentUser.role === 'doctor') {
        // Opciones para doctor
        this.destinationOptions = [
          { label: `Paciente: ${record.patient.name} ${record.patient.lastname}`, value: 'patient' },
          { label: `Mi correo: ${this.currentUser.email}`, value: 'self' },
          { label: 'Otro correo personalizado', value: 'other' }
        ];
        this.selectedDestinationType = 'patient';
      } else if (this.currentUser.role === 'patient') {
        // Opciones para paciente
        this.destinationOptions = [
          { label: `Mi correo: ${this.currentUser.email}`, value: 'self' }
        ];

        if (record.doctor) {
          this.destinationOptions.unshift(
            { label: `Dr. ${record.doctor.name} ${record.doctor.lastname}`, value: 'doctor' }
          );
          this.selectedDestinationType = 'doctor';
        } else {
          this.selectedDestinationType = 'self';
        }

        this.destinationOptions.push({ label: 'Otro correo personalizado', value: 'other' });
      }
    }

    this.updateEmailDestination();
    this.showEmailDialog = true;
  }

  getSelectedRecord(): any {
    if (!this.selectedRecordId) return null;
    return this.records.find(r => r.id === this.selectedRecordId);
  }

  updateEmailDestination(): void {
    const record = this.records.find(r => r.id === this.selectedRecordId);
    if (!record) return;

    switch (this.selectedDestinationType) {
      case 'doctor':
        if (record.doctor) {
          this.emailDestination = record.doctor.email;
          this.customMessage = `Estimado/a Dr. ${record.doctor.name} ${record.doctor.lastname}, le envío mi expediente médico #${record.id} para su revisión.`;
        }
        break;
      case 'patient':
        this.emailDestination = record.patient.email;
        this.customMessage = `Estimado/a ${record.patient.name} ${record.patient.lastname}, adjunto encontrará su expediente médico completo del ${new Date(record.created_at).toLocaleDateString('es-ES')}.`;
        break;
      case 'self':
        this.emailDestination = this.currentUser.email;
        this.customMessage = `Copia de su expediente médico #${record.id} del ${new Date(record.created_at).toLocaleDateString('es-ES')}.`;
        break;
      case 'other':
        this.emailDestination = this.customEmail;
        this.customMessage = `Expediente médico #${record.id} del ${new Date(record.created_at).toLocaleDateString('es-ES')}.`;
        break;
      default:
        this.emailDestination = '';
        this.customMessage = '';
    }
  }

  onDestinationTypeChange(): void {
    if (this.selectedDestinationType === 'other') {
      this.emailDestination = this.customEmail;
    } else {
      this.updateEmailDestination();
    }
  }

  onCustomEmailChange(): void {
    if (this.selectedDestinationType === 'other') {
      this.emailDestination = this.customEmail;
    }
  }

  closeEmailDialog(): void {
    this.showEmailDialog = false;
    this.selectedRecordId = null;
    this.emailDestination = '';
    this.customMessage = '';
    this.selectedDestinationType = 'doctor';
    this.customEmail = '';
    this.destinationOptions = [];
  }

  sendRecordByEmail(): void {
    if (!this.selectedRecordId || !this.emailDestination) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, ingresa una dirección de correo válida'
      });
      return;
    }

    // Validar formato de correo
    if (!this.isValidEmail(this.emailDestination)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, ingresa una dirección de correo válida'
      });
      return;
    }

    this.sendingEmail = true;

    // Obtener el expediente completo con riesgos
    this.recordService.getMedicalRecordWithRisks(this.selectedRecordId).subscribe({
      next: (recordWithRisks) => {
        // Enviar por correo
        this.emailService.sendMedicalRecordByEmail(
          recordWithRisks,
          this.emailDestination,
          this.customMessage
        ).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `El expediente médico ha sido enviado correctamente a ${this.emailDestination}`
            });
            this.closeEmailDialog();
          },
          error: (error) => {
            console.error('Error al enviar el correo:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo enviar el expediente por correo. Verifica tus credenciales de EmailJS.'
            });
          },
          complete: () => {
            this.sendingEmail = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener el expediente:', error);
        this.sendingEmail = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo obtener el expediente médico'
        });
      }
    });
  }

  isEmailInvalid(): boolean {
    if (this.selectedDestinationType === 'other') {
      return !this.customEmail || !this.isValidEmail(this.customEmail);
    } else {
      return !this.emailDestination || !this.isValidEmail(this.emailDestination);
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}