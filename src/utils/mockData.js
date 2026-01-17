export const MOCK_ASSETS = [
    {
      id: 'DE100-001',
      serial: 'SN-2023-8842',
      model: 'DE-100',
      client: 'Banco Santander',
      branch: 'Sucursal 504 - Centro',
      location: 'Área de Cajas Blindada',
      etv: 'Cometra',
      status: 'active',
      installDate: '2023-01-15',
      contract: {
        type: 'Preventivo Anual',
        renovationDate: '2024-01-15',
        visitsPerYear: 12,
        visitsCompleted: 8
      },
      history: [
        { 
          id: 101, 
          date: '2023-02-10', 
          type: 'Preventivo', 
          tech: 'Juan Pérez', 
          duration: 1.5, 
          parts: 'Kit Limpieza, Rodillos', 
          status: 'Completado', 
          notes: 'Mantenimiento rutina',
          description: 'Se realizó limpieza profunda de sensores CIS y validadores. Se reemplazaron rodillos de alimentación que presentaban desgaste del 40%. Pruebas de conteo exitosas con 500 billetes mezclados.',
          files: [] 
        },
        { 
          id: 102, 
          date: '2023-03-15', 
          type: 'Correctivo', 
          tech: 'Carlos Ruiz', 
          duration: 3.0, 
          parts: 'Sensor CIS, Correa', 
          status: 'Completado', 
          notes: 'Cambio de sensor atascado',
          description: 'El equipo presentaba error E-45 constante. Al abrir, se encontró el sensor CIS sucio y una correa de transmisión rota. Se procedió al cambio de ambas piezas y calibración.',
          files: [
              { name: 'Evidencia_Falla.jpg', type: 'image' },
              { name: 'Hoja_Servicio_Firmada.pdf', type: 'pdf' }
          ]
        },
      ]
    },
    {
      id: 'DE100-002',
      serial: 'SN-2023-9910',
      model: 'DE-50',
      client: 'Farmacias Guadalajara',
      branch: 'Av. Vallarta',
      location: 'Oficina Gerencia',
      etv: 'Sepsa',
      status: 'maintenance',
      installDate: '2023-05-20',
      contract: {
        type: 'Correctivo Plus',
        renovationDate: '2024-05-20',
        visitsPerYear: 4,
        visitsCompleted: 2
      },
      history: [
        { 
          id: 201, 
          date: '2023-06-01', 
          type: 'Instalación', 
          tech: 'Roberto G.', 
          duration: 5.0, 
          parts: 'Anclajes, Cableado', 
          status: 'Completado', 
          notes: 'Instalación inicial',
          description: 'Anclaje a piso de concreto. Configuración de IP estática solicitada por el cliente. Capacitación a gerente de sucursal.',
          files: [{ name: 'Acta_Entrega.pdf', type: 'pdf' }]
        }
      ]
    }
  ];