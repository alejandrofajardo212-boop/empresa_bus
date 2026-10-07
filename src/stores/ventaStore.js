import { defineStore } from 'pinia'
import { api } from '../boot/axios.js'

export const useVentaStore = defineStore('venta', {
  state: () => ({
    ventas: [],
    cargando: false,
    error: null
  }),

  getters: {
    totalIngresos: (state) =>
      state.ventas
        .filter(v => v.estado === 'Pagado')
        .reduce((sum, v) => sum + (Number(v.precio) || 0), 0),

    puestosOcupadosPorViaje: (state) => (viajeId) => {
      return state.ventas
        .filter(
          v =>
            String(v.viajeId) === String(viajeId) &&
            v.estado !== 'Cancelado'
        )
        .map(v => Number(v.puestoId))
    },

    puestoOcupado: (state) => (viajeId, puestoId) => {
      return state.ventas.some(
        v =>
          String(v.viajeId) === String(viajeId) &&
          Number(v.puestoId) === Number(puestoId) &&
          v.estado !== 'Cancelado'
      )
    }
  },

  actions: {
    // Cargar las ventas guardadas en MongoDB Atlas
    async cargarVentas() {
      this.cargando = true
      this.error = null

      try {
        const respuesta = await api.get('/bookings')

        const bookings = respuesta.data?.data || []

        this.ventas = bookings.map(b => ({
          id: b.ticketCode,
          _id: b._id,
          viajeId: b.trip?._id || b.trip,
          clienteNombre: b.customerName,
          clienteDoc: b.customerDoc,
          puestoId: b.seatNumber,
          precio: Number(b.totalAmount) || 0,
          fechaVenta: b.createdAt
            ? new Date(b.createdAt).toLocaleString()
            : '',
          estado: 'Pagado'
        }))
      } catch (e) {
        console.error(
          'Error al cargar ventas desde el backend:',
          e
        )

        this.error =
          e.response?.data?.message ||
          e.message ||
          'Error al cargar las ventas'

        throw e
      } finally {
        this.cargando = false
      }
    },

    // Crear una nueva venta y guardarla en el backend
    async crearVenta(datos) {
      try {
        const respuesta = await api.post('/bookings', {
          tripId: datos.viajeId,
          seatNumber: Number(datos.puestoId),
          customerName: datos.clienteNombre,
          customerDoc: datos.clienteDoc
        })

        const tiqueteDB = respuesta.data?.data

        if (!tiqueteDB) {
          throw new Error(
            'El backend no devolvió la información del tiquete'
          )
        }

        const nuevaVenta = {
          id: tiqueteDB.ticketCode,
          _id: tiqueteDB._id,
          viajeId: tiqueteDB.trip?._id || tiqueteDB.trip,
          clienteNombre: tiqueteDB.customerName,
          clienteDoc: tiqueteDB.customerDoc,
          puestoId: tiqueteDB.seatNumber,
          precio: Number(tiqueteDB.totalAmount) || 0,
          fechaVenta: tiqueteDB.createdAt
            ? new Date(tiqueteDB.createdAt).toLocaleString()
            : '',
          estado: 'Pagado'
        }

        this.ventas.push(nuevaVenta)

        return nuevaVenta
      } catch (error) {
        console.error(
          'Error al crear la venta:',
          error
        )

        const mensajeError =
          error.response?.data?.message ||
          error.message ||
          'No se pudo crear la venta'

        throw new Error(mensajeError)
      }
    },

    obtenerVenta(id) {
      return (
        this.ventas.find(
          v =>
            v.id === id ||
            v._id === id
        ) || null
      )
    }
  }
})
