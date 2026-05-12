export function descomponerRoles(rolUsuario) {
  if (!rolUsuario) return []

  return String(rolUsuario)
    .split(',')
    .map(rol => rol.trim().toLowerCase())
    .filter(Boolean)
}

export function tieneRol(rolUsuario, rolBuscado) {
  return descomponerRoles(rolUsuario).includes(String(rolBuscado).trim().toLowerCase())
}