import { defineStore } from 'pinia'
import { api } from 'boot/axios' // Instancia de Axios configurada en Quasar

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
        .reduce((sum, v) => sum + (v.precio || 0), 0),

    puestosOcupadosPorViaje: (state) => (viajeId) => {
      return state.ventas
        .filter(v => String(v.viajeId) === String(viajeId) && v.estado !== 'Cancelado')
        .map(v => Number(v.puestoId))
    },

    puestoOcupado: (state) => (viajeId, puestoId) => {
      return state.ventas.some(
        v => String(v.viajeId) === String(viajeId) &&
             Number(v.puestoId) === Number(puestoId) &&
             v.estado !== 'Cancelado'
      )
    }
  },

  actions: {
    // 1. Cargar las ventas reales guardadas en MongoDB Atlas
    async cargarVentas() {
      this.cargando = true
      try {
        const respuesta = await api.get('/bookings')
        // Mapear la respuesta de la API a la estructura requerida por la interfaz
        this.ventas = respuesta.data.data.map(b => ({
          id: b.ticketCode,
          _id: b._id,
          viajeId: b.trip?._id || b.trip,
          clienteNombre: b.customerName,
          clienteDoc: b.customerDoc,
          puestoId: b.seatNumber,
          precio: b.totalAmount,
          fechaVenta: new Date(b.createdAt).toLocaleString(),
          estado: 'Pagado'
        }))
      } catch (e) {
        console.error('Error al cargar ventas desde el backend:', e)
        this.error = e.response?.data?.message || e.message
      } finally {
        this.cargando = false
      }
    },

    // 2. Enviar el tiquete al backend de Render (bookingController.js)
    async crearVenta(datos) {
      try {
        const respuesta = await api.post('/bookings', {
          tripId: datos.viajeId,
          seatNumber: Number(datos.puestoId),
          customerName: datos.clienteNombre,
          customerDoc: datos.clienteDoc
        })

        const tiqueteDB = respuesta.data.data

        // Formatear e insertar el nuevo tiquete retornado por MongoDB
        const nuevaVenta = {
          id: tiqueteDB.ticketCode,
          _id: tiqueteDB._id,
          viajeId: tiqueteDB.trip?._id || tiqueteDB.trip,
          clienteNombre: tiqueteDB.customerName,
          clienteDoc: tiqueteDB.customerDoc,
          puestoId: tiqueteDB.seatNumber,
          precio: tiqueteDB.totalAmount,
          fechaVenta: new Date(tiqueteDB.createdAt).toLocaleString(),
          estado: 'Pagado'
        }

        this.ventas.push(nuevaVenta)
        return nuevaVenta
      } catch (error) {
        // Atrapa los mensajes del backend (ej: si el asiento 11000 ya fue vendido)
        const mensajeError = error.response?.data?.message || error.message
        throw new Error(mensajeError)
      }
    },

    obtenerVenta(id) {
      return this.ventas.find(v => v.id === id || v._id === id) || null
    }
  }
})
