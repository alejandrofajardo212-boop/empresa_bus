<template>
  <div style="max-width: 720px;">
    <!-- ENCABEZADO -->
    <div class="flex-between mb-20">
      <div>
        <div class="page-title">Registrar cliente</div>
        <div class="page-subtitle">Ingreso de un nuevo pasajero</div>
      </div>

      <RouterLink to="/clientes" class="btn btn-ghost">
        <ArrowLeft :size="16" /> Volver
      </RouterLink>
    </div>

    <!-- MENSAJE DE ÉXITO -->
    <div class="alert alert-success" v-if="exito">
      <CheckCircle2 :size="16" />
      <span>Cliente registrado exitosamente en la base de datos.</span>
    </div>

    <!-- FORMULARIO -->
    <div class="card">
      <form @submit.prevent="guardar">

        <div class="form-grid mb-16">

          <!-- TIPO DE DOCUMENTO -->
          <div class="form-group">
            <label class="form-label">
              Tipo de documento *
            </label>

            <select
              v-model="form.tipoDoc"
              class="form-select"
              :class="{ error: mostrarErrores && errors.tipoDoc }"
              @change="limpiarError('tipoDoc')"
            >
              <option value="">Seleccionar</option>
              <option value="CC">CC – Cédula de ciudadanía</option>
              <option value="TI">TI – Tarjeta de identidad</option>
              <option value="CE">CE – Cédula de extranjería</option>
              <option value="PP">PP – Pasaporte</option>
              <option value="NIT">NIT</option>
            </select>

            <span
              class="form-error"
              v-if="mostrarErrores && errors.tipoDoc"
            >
              <AlertCircle :size="14" />
              {{ errors.tipoDoc }}
            </span>
          </div>

          <!-- DOCUMENTO -->
          <div class="form-group">
            <label class="form-label">
              Número de documento *
            </label>

            <input
              v-model="form.documento"
              class="form-input"
              :class="{ error: mostrarErrores && errors.documento }"
              placeholder="Ej: 12345678"
              @input="limpiarError('documento')"
            />

            <span
              class="form-error"
              v-if="mostrarErrores && errors.documento"
            >
              <AlertCircle :size="14" />
              {{ errors.documento }}
            </span>
          </div>

          <!-- NOMBRE -->
          <div class="form-group full-width">
            <label class="form-label">
              Nombre completo *
            </label>

            <input
              v-model="form.nombre"
              class="form-input"
              :class="{ error: mostrarErrores && errors.nombre }"
              placeholder="Nombre y apellidos"
              @input="limpiarError('nombre')"
            />

            <span
              class="form-error"
              v-if="mostrarErrores && errors.nombre"
            >
              <AlertCircle :size="14" />
              {{ errors.nombre }}
            </span>
          </div>

          <!-- TELÉFONO -->
          <div class="form-group">
            <label class="form-label">
              Teléfono *
            </label>

            <input
              v-model="form.telefono"
              class="form-input"
              :class="{ error: mostrarErrores && errors.telefono }"
              placeholder="Ej: 3001234567"
              @input="limpiarError('telefono')"
            />

            <span
              class="form-error"
              v-if="mostrarErrores && errors.telefono"
            >
              <AlertCircle :size="14" />
              {{ errors.telefono }}
            </span>
          </div>

          <!-- CORREO -->
          <div class="form-group">
            <label class="form-label">
              Correo electrónico *
            </label>

            <input
              v-model="form.correo"
              type="email"
              class="form-input"
              :class="{ error: mostrarErrores && errors.correo }"
              placeholder="correo@mail.com"
              @input="limpiarError('correo')"
            />

            <span
              class="form-error"
              v-if="mostrarErrores && errors.correo"
            >
              <AlertCircle :size="14" />
              {{ errors.correo }}
            </span>
          </div>

          <!-- DIRECCIÓN -->
          <div class="form-group full-width">
            <label class="form-label">
              Dirección *
            </label>

            <input
              v-model="form.direccion"
              class="form-input"
              :class="{ error: mostrarErrores && errors.direccion }"
              placeholder="Dirección de residencia"
              @input="limpiarError('direccion')"
            />

            <span
              class="form-error"
              v-if="mostrarErrores && errors.direccion"
            >
              <AlertCircle :size="14" />
              {{ errors.direccion }}
            </span>
          </div>

        </div>

        <!-- BOTONES -->
        <div class="flex gap-12">

          <button
            type="submit"
            class="btn btn-primary btn-lg"
          >
            <Save :size="16" />
            Guardar cliente
          </button>

          <button
            type="button"
            class="btn btn-ghost"
            @click="limpiar"
          >
            Limpiar
          </button>

        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save
} from '@lucide/vue'

import { useClienteStore } from '../stores/clienteStore.js'

const store = useClienteStore()

/*
|--------------------------------------------------------------------------
| FORMULARIO
|--------------------------------------------------------------------------
*/

const form = reactive({
  tipoDoc: '',
  documento: '',
  nombre: '',
  telefono: '',
  correo: '',
  direccion: ''
})

/*
|--------------------------------------------------------------------------
| ERRORES
|--------------------------------------------------------------------------
*/

const errors = reactive({})

/*
|--------------------------------------------------------------------------
| ESTADOS
|--------------------------------------------------------------------------
*/

const exito = ref(false)

/*
 * Este estado controla cuándo se muestran
 * las validaciones.
 */
const mostrarErrores = ref(false)

/*
|--------------------------------------------------------------------------
| VALIDAR
|--------------------------------------------------------------------------
*/

function validar() {
  // Primero limpiamos los errores anteriores
  limpiarErrores()

  let valido = true

  if (!form.tipoDoc) {
    errors.tipoDoc = 'El tipo de documento es obligatorio.'
    valido = false
  }

  if (!form.documento.trim()) {
    errors.documento = 'El documento es obligatorio.'
    valido = false
  } else if (store.documentoExiste(form.documento.trim())) {
    errors.documento = 'Este documento ya está registrado.'
    valido = false
  }

  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio.'
    valido = false
  }

  if (!form.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio.'
    valido = false
  }

  if (!form.correo.trim()) {
    errors.correo = 'El correo es obligatorio.'
    valido = false
  }

  if (!form.direccion.trim()) {
    errors.direccion = 'La dirección es obligatoria.'
    valido = false
  }

  return valido
}

/*
|--------------------------------------------------------------------------
| GUARDAR
|--------------------------------------------------------------------------
*/

function guardar() {
  /*
   * Cada vez que se intenta guardar,
   * habilitamos la visualización de errores.
   */
  mostrarErrores.value = true

  /*
   * Ocultamos el mensaje de éxito anterior.
   */
  exito.value = false

  /*
   * Validamos.
   */
  if (!validar()) {
    return
  }

  /*
   * Guardamos el cliente.
   */
  store.registrarCliente({
    tipoDoc: form.tipoDoc,
    documento: form.documento.trim(),
    nombre: form.nombre.trim(),
    telefono: form.telefono.trim(),
    correo: form.correo.trim(),
    direccion: form.direccion.trim()
  })

  /*
   * =====================================================
   * GUARDADO CORRECTO
   * =====================================================
   */

  // Limpiamos TODOS los errores
  limpiarErrores()

  // Dejamos de mostrar validaciones
  mostrarErrores.value = false

  // Limpiamos los campos
  limpiarCampos()

  // Mostramos únicamente el mensaje de éxito
  exito.value = true
}

/*
|--------------------------------------------------------------------------
| LIMPIAR CAMPOS
|--------------------------------------------------------------------------
*/

function limpiarCampos() {
  Object.assign(form, {
    tipoDoc: '',
    documento: '',
    nombre: '',
    telefono: '',
    correo: '',
    direccion: ''
  })
}

/*
|--------------------------------------------------------------------------
| LIMPIAR ERRORES
|--------------------------------------------------------------------------
*/

function limpiarErrores() {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
}

/*
|--------------------------------------------------------------------------
| LIMPIAR ERROR INDIVIDUAL
|--------------------------------------------------------------------------
*/

function limpiarError(campo) {
  /*
   * Si el usuario empieza a corregir un campo,
   * quitamos inmediatamente su error.
   */
  if (errors[campo]) {
    delete errors[campo]
  }
}

/*
|--------------------------------------------------------------------------
| BOTÓN LIMPIAR
|--------------------------------------------------------------------------
*/

function limpiar() {
  // Limpiar campos
  limpiarCampos()

  // Limpiar errores
  limpiarErrores()

  // Ocultar errores
  mostrarErrores.value = false

  // Ocultar mensaje de éxito
  exito.value = false
}
</script>
