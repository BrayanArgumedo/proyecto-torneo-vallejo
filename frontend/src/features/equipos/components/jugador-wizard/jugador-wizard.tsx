import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/ui/input/input';
import { Select } from '@/shared/components/ui/select/select';
import { Button } from '@/shared/components/ui/button/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/shared/components/ui/card/card';
import { FileUpload } from '@/shared/components/forms/file-upload/file-upload';
import { Badge } from '@/shared/components/ui/badge/badge';
import { TipoJugador } from '@/types/enums';
import type { JugadorWizardData, CreateJugadorDTO } from '../../types/equipo.types';
import { useJugadores } from '../../hooks/use-jugadores';

// Paso 1: Datos b�sicos
const paso1Schema = z.object({
  nombres: z.string().min(2, 'Los nombres son requeridos'),
  apellidos: z.string().min(2, 'Los apellidos son requeridos'),
  numeroDocumento: z.string().min(6, 'N�mero de documento inv�lido'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  telefono: z.string().min(7, 'Tel�fono inv�lido'),
  telefonoEmergencia: z.string().min(7, 'Tel�fono de emergencia inv�lido'),
});

// Paso 3: Tipo de jugador
const paso3Schema = z.object({
  tipo: z.string().min(1, 'Debes seleccionar un tipo de jugador'),
});

interface JugadorWizardProps {
  equipoId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const JugadorWizard = ({ equipoId, onComplete, onCancel }: JugadorWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<JugadorWizardData>({
    nombres: '',
    apellidos: '',
    numeroDocumento: '',
    fechaNacimiento: '',
    telefono: '',
    telefonoEmergencia: '',
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [documentoIdentidadFile, setDocumentoIdentidadFile] = useState<File | null>(null);
  const [certificadoResidenciaFile, setCertificadoResidenciaFile] = useState<File | null>(null);

  const { createJugador, validateEdad } = useJugadores(equipoId);
  const [edadValidacion, setEdadValidacion] = useState<{ isValid: boolean; mensaje?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paso 1: Datos b�sicos
  const paso1Form = useForm({
    resolver: zodResolver(paso1Schema),
    defaultValues: {
      nombres: wizardData.nombres,
      apellidos: wizardData.apellidos,
      numeroDocumento: wizardData.numeroDocumento,
      fechaNacimiento: wizardData.fechaNacimiento,
      telefono: wizardData.telefono,
      telefonoEmergencia: wizardData.telefonoEmergencia,
    },
  });

  // Paso 3: Tipo de jugador
  const paso3Form = useForm<{ tipo: string }>({
    resolver: zodResolver(paso3Schema),
  });

  const handlePaso1Next = paso1Form.handleSubmit((data) => {
    const validacion = validateEdad(data.fechaNacimiento);
    setEdadValidacion(validacion);

    if (!validacion.isValid) {
      return;
    }

    setWizardData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  });

  const handlePaso2Next = () => {
    if (!fotoFile) {
      alert('Debes subir una foto del jugador');
      return;
    }
    setCurrentStep(3);
  };

  const handlePaso3Next = paso3Form.handleSubmit((data) => {
    setWizardData((prev) => ({ ...prev, tipo: data.tipo as TipoJugador }));
    setCurrentStep(4);
  });

  const handlePaso4Next = () => {
    if (!documentoIdentidadFile) {
      alert('Debes subir el documento de identidad');
      return;
    }

    // Certificado de residencia es opcional solo para algunos tipos
    const requiereCertificado =
      wizardData.tipo === TipoJugador.HABITANTE_PROPIETARIO ||
      wizardData.tipo === TipoJugador.HABITANTE_ARRENDATARIO;

    if (requiereCertificado && !certificadoResidenciaFile) {
      alert('Debes subir el certificado de residencia');
      return;
    }

    setCurrentStep(5);
  };

  const handleFinalSubmit = async () => {
    if (!fotoFile || !documentoIdentidadFile || !wizardData.tipo) {
      alert('Faltan datos requeridos');
      return;
    }

    setIsSubmitting(true);

    const createData: CreateJugadorDTO = {
      equipoId,
      nombres: wizardData.nombres,
      apellidos: wizardData.apellidos,
      numeroDocumento: wizardData.numeroDocumento,
      fechaNacimiento: wizardData.fechaNacimiento,
      telefono: wizardData.telefono,
      telefonoEmergencia: wizardData.telefonoEmergencia,
      foto: fotoFile,
      tipo: wizardData.tipo,
      documentoIdentidad: documentoIdentidadFile,
      certificadoResidencia: certificadoResidenciaFile || undefined,
    };

    const result = await createJugador(createData);
    setIsSubmitting(false);

    if (result) {
      onComplete();
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep
                ? 'bg-blue-600 text-white'
                : step < currentStep
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step < currentStep ? '' : step}
          </div>
          {step < 5 && (
            <div
              className={`w-12 h-1 ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderPaso1 = () => (
    <form onSubmit={handlePaso1Next}>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Datos B�sicos del Jugador</h3>

        <Input
          label="Nombres"
          placeholder="Ej: Juan Carlos"
          {...paso1Form.register('nombres')}
          error={paso1Form.formState.errors.nombres?.message}
        />

        <Input
          label="Apellidos"
          placeholder="Ej: P�rez G�mez"
          {...paso1Form.register('apellidos')}
          error={paso1Form.formState.errors.apellidos?.message}
        />

        <Input
          label="N�mero de Documento"
          placeholder="123456789"
          {...paso1Form.register('numeroDocumento')}
          error={paso1Form.formState.errors.numeroDocumento?.message}
        />

        <Input
          label="Fecha de Nacimiento"
          type="date"
          {...paso1Form.register('fechaNacimiento')}
          error={paso1Form.formState.errors.fechaNacimiento?.message}
        />

        {edadValidacion && !edadValidacion.isValid && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {edadValidacion.mensaje}
          </div>
        )}

        <Input
          label="Tel�fono"
          type="tel"
          placeholder="3001234567"
          {...paso1Form.register('telefono')}
          error={paso1Form.formState.errors.telefono?.message}
        />

        <Input
          label="Tel�fono de Emergencia"
          type="tel"
          placeholder="3007654321"
          {...paso1Form.register('telefonoEmergencia')}
          error={paso1Form.formState.errors.telefonoEmergencia?.message}
        />
      </CardContent>

      <CardFooter className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Siguiente
        </Button>
      </CardFooter>
    </form>
  );

  const renderPaso2 = () => (
    <div>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Foto del Jugador</h3>

        <FileUpload
          onFileSelect={setFotoFile}
          accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
          maxSize={5 * 1024 * 1024} // 5MB
        />
        <p className="text-sm text-gray-600">
          Sube una foto reciente del jugador. Formato: PNG, JPG o JPEG. Tama�o m�ximo: 5MB
        </p>
      </CardContent>

      <CardFooter className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
          Atr�s
        </Button>
        <Button type="button" variant="primary" onClick={handlePaso2Next}>
          Siguiente
        </Button>
      </CardFooter>
    </div>
  );

  const renderPaso3 = () => (
    <form onSubmit={handlePaso3Next}>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Tipo de Jugador</h3>

        <Select
          label="Categor�a del Jugador"
          options={[
            {
              value: TipoJugador.HABITANTE_PROPIETARIO,
              label: 'Habitante Propietario',
            },
            {
              value: TipoJugador.HABITANTE_ARRENDATARIO,
              label: 'Habitante Arrendatario',
            },
            {
              value: TipoJugador.DOCENTE_COLEGIO,
              label: 'Docente del Colegio',
            },
            {
              value: TipoJugador.DOCENTE_U_COMFACAUCA,
              label: 'Docente Universidad Comfacauca',
            },
            { value: TipoJugador.EXTRANJERO, label: 'Extranjero' },
          ]}
          {...paso3Form.register('tipo')}
          error={paso3Form.formState.errors.tipo?.message}
        />

        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <h4 className="font-medium text-blue-900 mb-2">Cuotas por Equipo:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>" M�ximo 16 jugadores por equipo</li>
            <li>" M�ximo 4 docentes (2 del colegio + 2 de U. Comfacauca)</li>
            <li>" M�ximo 2 extranjeros</li>
            <li>" Edad m�nima: 15 a�os</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
          Atr�s
        </Button>
        <Button type="submit" variant="primary">
          Siguiente
        </Button>
      </CardFooter>
    </form>
  );

  const renderPaso4 = () => {
    const requiereCertificado =
      wizardData.tipo === TipoJugador.HABITANTE_PROPIETARIO ||
      wizardData.tipo === TipoJugador.HABITANTE_ARRENDATARIO;

    return (
      <div>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Documentos del Jugador</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documento de Identidad <span className="text-red-500">*</span>
            </label>
            <FileUpload
              onFileSelect={setDocumentoIdentidadFile}
              accept={{
                'image/*': ['.png', '.jpg', '.jpeg'],
                'application/pdf': ['.pdf'],
              }}
              maxSize={5 * 1024 * 1024} // 5MB
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: PNG, JPG, JPEG o PDF. Tama�o m�ximo: 5MB
            </p>
          </div>

          {requiereCertificado && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificado de Residencia <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onFileSelect={setCertificadoResidenciaFile}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg'],
                  'application/pdf': ['.pdf'],
                }}
                maxSize={5 * 1024 * 1024} // 5MB
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: PNG, JPG, JPEG o PDF. Tama�o m�ximo: 5MB
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
            Atr�s
          </Button>
          <Button type="button" variant="primary" onClick={handlePaso4Next}>
            Siguiente
          </Button>
        </CardFooter>
      </div>
    );
  };

  const renderPaso5 = () => (
    <div>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Confirmaci�n</h3>

        <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
          <div>
            <p className="text-sm text-gray-600">Nombre Completo:</p>
            <p className="font-medium">{wizardData.nombres} {wizardData.apellidos}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Documento:</p>
            <p className="font-medium">{wizardData.numeroDocumento}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Fecha de Nacimiento:</p>
            <p className="font-medium">{wizardData.fechaNacimiento}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Tel�fono:</p>
            <p className="font-medium">{wizardData.telefono}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Tipo de Jugador:</p>
            <Badge variant="info">{wizardData.tipo}</Badge>
          </div>

          <div>
            <p className="text-sm text-gray-600">Archivos adjuntos:</p>
            <ul className="list-disc list-inside text-sm">
              <li>Foto: {fotoFile?.name}</li>
              <li>Documento de identidad: {documentoIdentidadFile?.name}</li>
              {certificadoResidenciaFile && (
                <li>Certificado de residencia: {certificadoResidenciaFile.name}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-sm text-yellow-800">
            � El jugador quedar� en estado <strong>PENDIENTE</strong> hasta que un
            administrador valide sus documentos.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(4)}>
          Atr�s
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Jugador'}
        </Button>
      </CardFooter>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Registrar Nuevo Jugador</h2>
        {renderStepIndicator()}
      </CardHeader>

      {currentStep === 1 && renderPaso1()}
      {currentStep === 2 && renderPaso2()}
      {currentStep === 3 && renderPaso3()}
      {currentStep === 4 && renderPaso4()}
      {currentStep === 5 && renderPaso5()}
    </Card>
  );
};
