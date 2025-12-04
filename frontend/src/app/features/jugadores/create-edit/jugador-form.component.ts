// src/app/features/jugadores/create-edit/jugador-form.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn
} from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';

// Services & Models
import { JugadoresService, CreateJugadorDto } from '../jugadores.service';
import { AuthService } from '../../../core/services/auth.service';
import { TipoJugador, Posicion, Jugador } from '../../../shared/models';
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'app-jugador-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    InputMaskModule,
    MessageModule,
    MessagesModule,
    InputNumberModule,
    FileUploadModule,
    ProgressBarModule
  ],
  providers: [MessageService],
  templateUrl: './jugador-form.component.html',
  styleUrl: './jugador-form.component.scss'
})
export class JugadorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private jugadoresService = inject(JugadoresService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  // ============================================
  // Signals
  // ============================================
  loading = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  jugadorId = signal<string | null>(null);
  selectedFoto = signal<File | null>(null);
  fotoPreview = signal<string | null>(null);

  // ============================================
  // Form
  // ============================================
  form!: FormGroup;

  // ============================================
  // Dropdown Options
  // ============================================
  tipoJugadorOptions = [
    { label: 'Habitante Propietario', value: TipoJugador.HABITANTE_PROPIETARIO },
    { label: 'Habitante Hijo de Propietario', value: TipoJugador.HABITANTE_HIJO_PROPIETARIO },
    { label: 'Habitante Arrendatario', value: TipoJugador.HABITANTE_ARRENDATARIO },
    { label: 'Docente I.E. El Dorado', value: TipoJugador.DOCENTE_IE_EL_DORADO },
    { label: 'Trabajador I.E. El Dorado', value: TipoJugador.TRABAJADOR_IE_EL_DORADO },
    { label: 'Estudiante I.E. El Dorado', value: TipoJugador.ESTUDIANTE_IE_EL_DORADO },
    { label: 'Padre I.E. El Dorado', value: TipoJugador.PADRE_IE_EL_DORADO },
    { label: 'Docente Fundación Vallejo', value: TipoJugador.DOCENTE_FUNDACION_VALLEJO },
    { label: 'Trabajador Fundación Vallejo', value: TipoJugador.TRABAJADOR_FUNDACION_VALLEJO },
    { label: 'Padre Fundación Vallejo', value: TipoJugador.PADRE_FUNDACION_VALLEJO },
    { label: 'Extranjero afiliado I.E. El Dorado', value: TipoJugador.EXTRANJERO_AFILIADO_IE },
    { label: 'Extranjero afiliado Fundación Vallejo', value: TipoJugador.EXTRANJERO_AFILIADO_FUNDACION },
    { label: 'Extranjero libre', value: TipoJugador.EXTRANJERO_LIBRE }
  ];

  posicionOptions = [
    { label: 'Portero', value: Posicion.PORTERO },
    { label: 'Defensa', value: Posicion.DEFENSA },
    { label: 'Volante', value: Posicion.VOLANTE },
    { label: 'Delantero', value: Posicion.DELANTERO }
  ];

  // TODO: Cargar equipos desde API
  equipoOptions = signal<any[]>([]);

  // ============================================
  // Computed
  // ============================================
  readonly isAdmin = this.authService.isAdmin;
  readonly isDelegado = this.authService.isDelegado;
  readonly currentUser = this.authService.currentUser;

  // ============================================
  // Lifecycle
  // ============================================
  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    // TODO: Cargar equipos disponibles
  }

  // ============================================
  // Form Initialization
  // ============================================
  private initForm(): void {
    this.form = this.fb.group({
      // Datos Personales
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      cedula: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{6,15}$/)],
        [this.cedulaUnicaValidator()]
      ],
      fechaNacimiento: ['', [Validators.required, this.edadValidator()]],
      celular: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.email]],
      direccion: ['', [Validators.maxLength(200)]],

      // Datos Deportivos
      tipo: ['', [Validators.required]],
      posicion: ['', [Validators.required]],
      numeroCamiseta: [
        null,
        [Validators.required, Validators.min(1), Validators.max(20)],
        [this.numeroCamisetaUnicoValidator()]
      ],
      equipoId: ['', [Validators.required]],

      // Opcionales según tipo
      institucionEducativa: [''],
      parentescoEstudiante: ['']
    });

    // Validación dinámica según tipo de jugador
    this.form.get('tipo')?.valueChanges.subscribe((tipo) => {
      this.updateConditionalValidators(tipo);
    });

    // Auto-fill equipoId para delegados
    if (this.isDelegado()) {
      const user = this.currentUser();
      if (user?.equipoId) {
        this.form.patchValue({ equipoId: user.equipoId });
        this.form.get('equipoId')?.disable();
      }
    }
  }

  // ============================================
  // Check Edit Mode
  // ============================================
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.jugadorId.set(id);
      this.loadJugador(id);
    }
  }

  private loadJugador(id: string): void {
    this.loading.set(true);

    this.jugadoresService.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.populateForm(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading jugador:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el jugador'
        });
        this.loading.set(false);
      }
    });
  }

  private populateForm(jugador: Jugador): void {
    this.form.patchValue({
      nombre: jugador.nombre,
      apellido: jugador.apellido,
      cedula: jugador.cedula,
      fechaNacimiento: new Date(jugador.fechaNacimiento),
      celular: jugador.celular,
      email: jugador.email,
      direccion: jugador.direccion,
      tipo: jugador.tipo,
      posicion: jugador.posicion,
      numeroCamiseta: jugador.numeroCamiseta,
      equipoId: jugador.equipoId,
      institucionEducativa: jugador.institucionEducativa,
      parentescoEstudiante: jugador.parentescoEstudiante
    });

    if (jugador.foto) {
      this.fotoPreview.set(jugador.foto);
    }
  }

  // ============================================
  // Custom Validators
  // ============================================

  /**
   * Valida que la edad esté entre 16 y 60 años
   */
  private edadValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const validacion = this.jugadoresService.validarEdad(control.value);

      if (!validacion.valida) {
        return { edadInvalida: { mensaje: validacion.mensaje, edad: validacion.edad } };
      }

      return null;
    };
  }

  /**
   * Valida que la cédula no esté registrada (async)
   */
  private cedulaUnicaValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      return of(control.value).pipe(
        debounceTime(500),
        switchMap((cedula) => {
          const jugadorId = this.jugadorId();
          return this.jugadoresService.checkCedulaDisponible(cedula, jugadorId || undefined);
        }),
        map((response) => {
          if (response.success && response.data) {
            return response.data.disponible ? null : { cedulaNoDisponible: true };
          }
          return null;
        }),
        catchError(() => of(null))
      );
    };
  }

  /**
   * Valida que el número de camiseta esté disponible en el equipo (async)
   */
  private numeroCamisetaUnicoValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      const equipoId = this.form?.get('equipoId')?.value;
      if (!equipoId) return of(null);

      return of(control.value).pipe(
        debounceTime(500),
        switchMap((numero) => {
          const jugadorId = this.jugadorId();
          return this.jugadoresService.checkNumeroCamisetaDisponible(
            equipoId,
            numero,
            jugadorId || undefined
          );
        }),
        map((response) => {
          if (response.success && response.data) {
            return response.data.disponible ? null : { numeroCamisetaNoDisponible: true };
          }
          return null;
        }),
        catchError(() => of(null))
      );
    };
  }

  // ============================================
  // Conditional Validators
  // ============================================
  private updateConditionalValidators(tipo: string): void {
    const institucionControl = this.form.get('institucionEducativa');
    const parentescoControl = this.form.get('parentescoEstudiante');

    // Reset
    institucionControl?.clearValidators();
    parentescoControl?.clearValidators();

    // Estudiantes requieren institución
    if (tipo === TipoJugador.ESTUDIANTE_IE_EL_DORADO) {
      institucionControl?.setValidators([Validators.required]);
    }

    // Padres requieren parentesco
    if (
      tipo === TipoJugador.PADRE_IE_EL_DORADO ||
      tipo === TipoJugador.PADRE_FUNDACION_VALLEJO
    ) {
      parentescoControl?.setValidators([Validators.required]);
    }

    institucionControl?.updateValueAndValidity();
    parentescoControl?.updateValueAndValidity();
  }

  // ============================================
  // File Upload
  // ============================================
  onFotoSelect(event: any): void {
    const file = event.files[0];

    if (file) {
      this.selectedFoto.set(file);

      // Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoPreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  onFotoRemove(): void {
    this.selectedFoto.set(null);
    this.fotoPreview.set(null);
  }

  // ============================================
  // Submit
  // ============================================
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Formulario Inválido',
        detail: 'Por favor, complete todos los campos requeridos correctamente'
      });
      return;
    }

    // Validar reglas de negocio
    this.validarReglamentoYEnviar();
  }

  private validarReglamentoYEnviar(): void {
    const equipoId = this.form.get('equipoId')?.value;
    const tipo = this.form.get('tipo')?.value;

    this.jugadoresService.validarReglamento(equipoId, tipo).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (!response.data.valido) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Advertencia',
              detail: response.data.mensaje || 'El jugador no cumple con el reglamento'
            });
          }

          // Continuar con el envío (el backend hará validación final)
          this.enviarFormulario();
        }
      },
      error: () => {
        // Si falla la validación, continuar igual (backend validará)
        this.enviarFormulario();
      }
    });
  }

  private enviarFormulario(): void {
    this.loading.set(true);

    const formData: CreateJugadorDto = {
      ...this.form.getRawValue(),
      fechaNacimiento: new Date(this.form.value.fechaNacimiento)
    };

    const request = this.isEditMode()
      ? this.jugadoresService.update(this.jugadorId()!, formData)
      : this.jugadoresService.create(formData);

    request.subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Jugador ${this.isEditMode() ? 'actualizado' : 'creado'} correctamente`
          });

          // Upload foto si existe
          if (this.selectedFoto()) {
            this.uploadFoto(response.data._id);
          } else {
            this.navigateToList();
          }
        }
      },
      error: (error) => {
        console.error('Error saving jugador:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'No se pudo guardar el jugador'
        });
        this.loading.set(false);
      }
    });
  }

  private uploadFoto(jugadorId: string): void {
    const foto = this.selectedFoto();
    if (!foto) {
      this.navigateToList();
      return;
    }

    this.jugadoresService.uploadFoto(jugadorId, foto).subscribe({
      next: () => {
        this.navigateToList();
      },
      error: (error) => {
        console.error('Error uploading foto:', error);
        // No mostrar error, el jugador ya fue creado
        this.navigateToList();
      }
    });
  }

  // ============================================
  // Navigation
  // ============================================
  onCancel(): void {
    this.navigateToList();
  }

  private navigateToList(): void {
    this.router.navigate(['/admin/jugadores']);
  }

  // ============================================
  // Helpers
  // ============================================
  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);

    if (field?.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) return 'Campo requerido';
      if (field.errors?.['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors?.['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors?.['email']) return 'Email inválido';
      if (field.errors?.['pattern']) return 'Formato inválido';
      if (field.errors?.['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors?.['max']) return `Valor máximo: ${field.errors['max'].max}`;
      if (field.errors?.['edadInvalida']) return field.errors['edadInvalida'].mensaje;
      if (field.errors?.['cedulaNoDisponible']) return 'Cédula ya registrada';
      if (field.errors?.['numeroCamisetaNoDisponible']) return 'Número ya asignado en este equipo';
    }

    return null;
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && (field.dirty || field.touched));
  }

  getEdadActual(): number | null {
    const fechaNacimiento = this.form.get('fechaNacimiento')?.value;
    if (!fechaNacimiento) return null;

    return this.jugadoresService.calcularEdad(fechaNacimiento);
  }
}
