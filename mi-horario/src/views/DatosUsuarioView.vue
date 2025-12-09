<template>
    <MenuLateral />

    <div class="container-xl mt-5 pt-4 px-3">
        <!-- Contenedor principal con margen horizontal -->

        <!-- Perfil -->
        <div class="mt-4 d-flex flex-column align-items-center">
            <input type="file" accept="image/*" ref="inputArchivo" @change="subirImagen" style="display: none;" />

            <img :src="imagenPerfil || imagenPorDefecto" alt="Foto de perfil" class="rounded-circle"
                :style="{ width: '150px', height: '150px', objectFit: 'cover', cursor: profesor?.usuario ? 'pointer' : 'not-allowed' }"
                @click="profesor?.usuario && confirmarYSubir()" />


            <p class="mt-3">{{ profesor?.nombre }}</p>
            <p v-if="profesor?.usuario"><strong>Email:</strong> {{ profesor.usuario.email }}</p>
        </div>

        <!-- Botones -->
        <div class="mt-5 text-center " v-if="profesor">
            <button class="btn btn-secondary me-2" @click="mostrarFormulario('edit')" v-if="profesor?.usuario">Editar
                Usuario</button>
            <button class="btn btn-danger" @click="eliminarUsuario" v-if="profesor?.usuario">Eliminar Usuario</button>
            <div v-else>
                <button class="btn btn-primary me-2" @click="mostrarFormulario('create')">Crear Usuario</button>
            </div>
        </div>

        <!-- Formulario -->
        <div class="mt-3 d-flex justify-content-center">
            <FormularioCrearUsuario v-if="formularioActivo === 'create'" :profesor="profesor"
                :errores="erroresFormulario" :isLoading="isLoading" @guardar="guardarUsuario" />
            <FormularioEditarUsuario v-if="formularioActivo === 'edit'" :profesor="profesor"
                :errores="erroresFormulario" :isLoading="isLoading" @actualizar="modificarUsuario" />
        </div>

        <!-- Horario -->
        <div class="mt-5">
            <Horario :idProfesor="profesor?.idProfesor" />

            <!-- Botón para mostrar el formulario de ausencia -->
            <div class="text-center mt-4 mb-3">
                <button class="btn btn-outline-warning" @click="mostrarFormularioAusencia = !mostrarFormularioAusencia">
                    {{ mostrarFormularioAusencia ? 'Cancelar' : 'Crear Ausencia' }}
                </button>
            </div>


            <FormularioCrearAusencia v-if="mostrarFormularioAusencia" :idProfesor="profesor?.idProfesor"
                @ausenciaCreada="onAusenciaCreada" @error="mensaje => mostrarModal(' Error', mensaje, 'error')" />

            <AusenciasProfesor v-if="profesor?.usuario?.id" :idUsuario="profesor.usuario.id" :key="ausenciasKey" />

        </div>
    </div>

    <!-- Modal -->
    <ModalMensaje :visible="modal.visible" :titulo="modal.titulo" :mensaje="modal.mensaje" :tipo="modal.tipo"
        @cerrar="modal.visible = false" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import MenuLateral from '../components/MenuLateral.vue'
import Horario from '../components/Horario.vue'
import ModalMensaje from '../components/ModalMensaje.vue'
import AusenciasProfesor from '../components/AusenciasProfesor.vue'
import FormularioCrearUsuario from '../components/FormularioCrearUsuario.vue'
import FormularioEditarUsuario from '../components/FormularioEditarUsuario.vue'
import FormularioCrearAusencia from '../components/FormularioCrearAusencia.vue'

const route = useRoute()
const idProfesor = route.params.id


const profesor = ref(null)
const imagenPerfil = ref(null)
const inputArchivo = ref(null)
const formularioActivo = ref(null)
const erroresFormulario = ref({})
const isLoading = ref(false)
const ausenciasKey = ref(Date.now())

const imagenPorDefecto = 'https://img.freepik.com/vector-premium/icono-usuario-avatar-perfil-usuario-icono-persona-imagen-perfil-silueta-neutral-genero-adecuado_697711-1132.jpg'

const modal = ref({
    visible: false,
    titulo: '',
    mensaje: '',
    tipo: 'info'
})

function mostrarModal(titulo, mensaje, tipo = 'info') {
    modal.value = { visible: true, titulo, mensaje, tipo }
}

function mostrarFormulario(tipo) {
    formularioActivo.value = formularioActivo.value === tipo ? null : tipo
    erroresFormulario.value = {}
}

async function obtenerDatosProfesor() {
    try {
        const response = await axios.get(`http://localhost:8081/api/profesores/${idProfesor}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        profesor.value = response.data
        if (!profesor.value.usuario || !profesor.value.usuario.imagen) {
            imagenPerfil.value = null  // Limpiar imagen si no hay usuario o imagen
        } else {
            await cargarImagen()
        }

    } catch (error) {
        mostrarModal('Error', 'No se pudo cargar el profesor.', 'error')
    }
}

async function cargarImagen() {
    try {
        const idUsuario = profesor.value?.usuario?.id
        if (!idUsuario || !profesor.value.usuario.imagen) return

        const response = await axios.get(`http://localhost:8081/api/usuarios/${idUsuario}/imagen`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            responseType: 'arraybuffer',
            validateStatus: status => status === 200
        })

        const tipo = response.headers['content-type']
        const base64 = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''))
        imagenPerfil.value = `data:${tipo};base64,${base64}`
    } catch {
        imagenPerfil.value = null
    }
}

function confirmarYSubir() {
    if (confirm('¿Estás seguro de que quieres subir una nueva imagen de perfil?')) {
        inputArchivo.value?.click()
    }
}

async function subirImagen(event) {
    const archivo = event.target.files[0]
    const idUsuario = profesor.value?.usuario?.id
    if (!archivo || !idUsuario) return

    const formData = new FormData()
    formData.append('imagen', archivo)

    try {
        const response = await axios.post(`http://localhost:8081/api/usuarios/${idUsuario}/imagen`, formData, {
            headers: { 
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        console.log(response)
        mostrarModal(' Imagen actualizada', response.data, 'success')
        await obtenerDatosProfesor()

    } catch (error) {
        console.log(error)
        const mensajeError = error.response?.data || 'Error desconocido'
        mostrarModal(' Error', mensajeError, 'error')
    }
}



onMounted(() => {
    obtenerDatosProfesor()
})

async function guardarUsuario(datosFormulario) {
    const { idProfesor, email, password, rol, nombre } = datosFormulario

    if (!email || !password || !rol || !nombre || !idProfesor) {
        mostrarModal(' Campos incompletos', 'Por favor, completa todos los campos.', 'warning')
        return
    }

    const payload = { idProfesor, nombre, email, contraseña: password, rol }
    isLoading.value = true

    try {
        const response = await axios.post(`http://localhost:8081/api/usuarios/crear-con-profesor/${idProfesor}`, payload, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })

        console.log(' Usuario creado. Respuesta del backend:', response)
        mostrarModal('Usuario creado', `Se ha vinculado correctamente a ${nombre}`, 'success')
        formularioActivo.value = null
        await obtenerDatosProfesor()
    } catch (error) {
        console.error(' Error al crear usuario:', error)
        console.log('⚠️ error.response:', error.response)
        console.log('📩 error.response.data:', error.response?.data)

        if (error.response?.status === 400 && error.response.data) {
            erroresFormulario.value = error.response.data

            // Mostrar mensaje si el backend devuelve "mensaje"
            const mensaje = error.response.data.mensaje || 'Error correo no valido.'
            mostrarModal(' Error', mensaje, 'error')
        } else {
            mostrarModal(' Error', mensaje, 'error')
        }
    } finally {
        isLoading.value = false
    }
}


async function modificarUsuario(datosFormulario) {
    const { idUsuario, email, password, rol, nombre } = datosFormulario
    if (!idUsuario) {
        mostrarModal(' Error', 'El ID del usuario no puede ser nulo.', 'error')
        return
    }

    const payload = { idUsuario, nombre, email, contraseña: password, rol }
    isLoading.value = true

    try {
        const response = await axios.put(`http://localhost:8081/api/usuarios/${idUsuario}`, payload, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })

        console.log(' Usuario modificado. Respuesta del backend:', response)
        console.log('📨 response.data:', response.data)

        mostrarModal(' Usuario modificado', `Se ha modificado correctamente a ${nombre}`, 'success')
        formularioActivo.value = null
        await obtenerDatosProfesor()
    } catch (error) {
        console.error(' Error al modificar usuario:', error)
        console.log('⚠️ error.response:', error.response)
        console.log('📩 error.response.data:', error.response?.data)

        if (error.response?.status === 400 && error.response.data) {
            erroresFormulario.value = error.response.data
        } else {
            mostrarModal(' Error', response.data, 'error')
        }
    } finally {
        isLoading.value = false
    }
}


async function eliminarUsuario() {
    const usuario = profesor.value?.usuario
    const nombre = profesor.value?.nombre

    if (!usuario?.id) return

    const confirmado = confirm(`¿Estás seguro de eliminar el usuario vinculado a ${nombre}?`)
    if (!confirmado) return

    isLoading.value = true

    try {
        await axios.delete(`http://localhost:8081/api/usuarios/${usuario.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        mostrarModal(' Usuario eliminado', `El usuario de ${nombre} ha sido eliminado.`, 'success')
        formularioActivo.value = null
        await obtenerDatosProfesor()
    } catch (error) {
        console.error('Error al eliminar usuario:', error)
        mostrarModal(' Error', 'No se pudo eliminar el usuario.', 'error')
    } finally {
        isLoading.value = false
    }
}

const mostrarFormularioAusencia = ref(false)

function onAusenciaCreada() {
    mostrarModal(' Ausencia creada', 'La ausencia fue registrada correctamente.', 'success')
    mostrarFormularioAusencia.value = false
    ausenciasKey.value = Date.now() // fuerza el render del componente AusenciasProfesor
}


</script>

<style scoped>
.contenedor-datos {
    max-width: 600px;
    margin: auto;
}
</style>
