<template>
  <div class="container mt-5 pt-5">

    <div class="card p-4 shadow">
      <div class="d-flex align-items-center mb-3">
        <img
          :src="imagenPerfil || imagenPorDefecto"
          class="rounded-circle me-3"
          style="width: 64px; height: 64px; object-fit: cover;"
        />
        <strong>{{ auth.usuario.nombre }}</strong>
      </div>

      <!-- Subir imagen -->
      <label for="inputFotoPerfil" class="btn btn-outline-secondary mb-3" style="cursor: pointer;">
        {{ t('profile.uploadNewProfilePhoto') }}
      </label>
      <input
        id="inputFotoPerfil"
        type="file"
        accept="image/*"
        @change="subirImagen"
        style="display: none;"
      />

      <!-- Cambiar contraseña -->
      <div v-if="errorPassword" class="text-danger mb-2">{{ errorPassword }}</div>
      <input v-model="nuevaPassword" type="password" class="form-control mb-2" :placeholder="t('profile.newPassword')" />
      <input v-model="confirmacionPassword" type="password" class="form-control mb-3" :placeholder="t('profile.confirmPassword')" />
      <button class="btn btn-primary w-100 mb-3" @click="cambiarPassword">{{ t('profile.changePassword') }}</button>

      <!-- Logout -->
      <button class="btn btn-outline-danger w-100" @click="logout">{{ t('profile.logout') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../composables/useI18n'
import axios from 'axios'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const imagenPerfil = ref(null)
const imagenPorDefecto = 'https://img.freepik.com/vector-premium/icono-usuario-avatar-perfil-usuario-icono-persona-imagen-perfil-silueta-neutral-genero-adecuado_697711-1132.jpg'

const nuevaPassword = ref('')
const confirmacionPassword = ref('')
const errorPassword = ref('')

function logout() {
  auth.logout()
  router.push('/login')
}

function subirImagen(event) {
  const archivo = event.target.files[0]
  if (!archivo) return

  const formData = new FormData()
  formData.append('imagen', archivo)

  axios.post(
    `/api/usuarios/${auth.usuario.id}/imagen`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    }
  ).then(() => {
    alert(t('profile.imageUploadSuccess'))
    cargarImagenConToken()
  }).catch(err => {
    console.error(err)
    alert(t('profile.imageUploadError'))
  })
}

async function cargarImagenConToken() {
  try {
    const response = await axios.get(
      `/api/usuarios/${auth.usuario.id}/imagen`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        },
        responseType: 'arraybuffer',
        validateStatus: status => status === 200
      }
    )

    const tipo = response.headers['content-type'] || 'image/jpeg'
    const base64 = btoa(
      new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )
    imagenPerfil.value = `data:${tipo};base64,${base64}`
  } catch (error) {
    console.warn(t('profile.noImageFound'))
    imagenPerfil.value = imagenPorDefecto
  }
}

async function cambiarPassword() {
  errorPassword.value = ''

  if (!nuevaPassword.value || nuevaPassword.value.length < 6) {
    errorPassword.value = t('profile.passwordMinLength')
    return
  }

  if (nuevaPassword.value !== confirmacionPassword.value) {
    errorPassword.value = t('profile.passwordsDoNotMatch')
    return
  }

  try {
    await axios.put(
      `/api/usuarios/${auth.usuario.id}/cambiar-Contrasena`,
      { nuevaContrasena: nuevaPassword.value },
      {
        headers: { Authorization: `Bearer ${auth.token}` }
      }
    )

    auth.usuario.cambiarContraseña = false
    localStorage.setItem('usuario', JSON.stringify(auth.usuario))

    alert(t('profile.passwordChangeSuccess'))
    nuevaPassword.value = ''
    confirmacionPassword.value = ''
  } catch (err) {
    errorPassword.value = t('profile.passwordChangeError')
    console.error(err)
  }
}

onMounted(() => {
  cargarImagenConToken()
})
</script>

<style scoped>
.card {
  max-width: 500px;
  margin: auto;
}
</style>
