/**
 * 📋 VALIDACIÓN CON ZOD
 * 
 * Centraliza todos los schemas de validación usando Zod.
 * Zod permite:
 * ✅ Definir estructura de datos
 * ✅ Validar en runtime
 * ✅ Mensaje de errores personalizados
 * ✅ Reutilizar en formularios + API
 * 
 * IMPORTANCIA:
 * - Sin validación: guardo datos malos en BD
 * - Con validación: garantiza integridad de datos
 * 
 * ESTRUCTURA:
 * 1. Schemas individuales (para cada entidad)
 * 2. Schemas compuestos (combinaciones)
 * 3. Utilitarios (funciones para validar)
 */

import { z } from 'zod';

// ============================================================================
// 🏠 PROPIEDADES
// ============================================================================

/**
 * Schema mínimo para crear una propiedad
 * Solo los campos REQUERIDOS
 */
export const propertyCreateSchema = z.object({
  name: z
    .string('Nombre requerido')
    .min(3, 'Mínimo 3 caracteres')
    .max(255, 'Máximo 255 caracteres'),
  
  location: z
    .string('Ubicación requerida')
    .min(5, 'Mínimo 5 caracteres')
    .max(255, 'Máximo 255 caracteres'),
  
  category: z
    .enum(
      [
        'Habitaciones alquiler',
        'Inversiones',
        'Propiedades en venta',
        'Propiedades en alquiler',
        'Obras'
      ],
      { errorMap: () => ({ message: 'Categoría inválida' }) }
    )
    .optional(),
  
  price: z
    .number('Precio debe ser un número')
    .min(0, 'Precio no puede ser negativo')
    .optional(),
  
  description: z
    .string()
    .max(5000, 'Descripción muy larga')
    .optional(),
  
  availability: z
    .boolean()
    .optional()
    .default(true),
  
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      'Imagen no puede superar 5MB'
    )
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Solo se aceptan JPG, PNG, WebP'
    )
});

/**
 * Schema para ACTUALIZAR propiedades (todos los campos opcionales)
 */
export const propertyUpdateSchema = propertyCreateSchema.partial();

/**
 * Schema para filtrar/buscar propiedades
 */
export const propertyFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price', 'name', 'created']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// ============================================================================
// 👤 USUARIOS / AUTENTICACIÓN
// ============================================================================

/**
 * Schema para LOGIN
 */
export const loginSchema = z.object({
  email: z
    .string('Email requerido')
    .email('Email inválido'),
  
  password: z
    .string('Contraseña requerida')
    .min(6, 'Contraseña muy corta')
});

/**
 * Schema para REGISTRO/SIGNUP
 */
export const signupSchema = z
  .object({
    name: z
      .string('Nombre requerido')
      .min(2, 'Mínimo 2 caracteres')
      .max(100, 'Máximo 100 caracteres'),
    
    email: z
      .string('Email requerido')
      .email('Email inválido'),
    
    password: z
      .string('Contraseña requerida')
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir mayúscula')
      .regex(/[0-9]/, 'Debe incluir número'),
    
    passwordConfirm: z
      .string('Confirmar contraseña requerida')
  })
  .refine(
    (data) => data.password === data.passwordConfirm,
    {
      message: 'Las contraseñas no coinciden',
      path: ['passwordConfirm']
    }
  );

/**
 * Schema para actualizar perfil de usuario
 */
export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .optional(),
  
  email: z
    .string()
    .email('Email inválido')
    .optional(),
  
  emailVisibility: z.boolean().optional()
});

// ============================================================================
// ⭐ FAVORITOS
// ============================================================================

/**
 * Schema para agregar favorito
 */
export const favoriteCreateSchema = z.object({
  propertyId: z
    .string('ID de propiedad requerido')
    .min(1, 'ID inválido')
});

// ============================================================================
// 🔍 BÚSQUEDA / FILTROS
// ============================================================================

/**
 * Schema para parámetros de búsqueda (URL query string)
 */
export const searchParamsSchema = z.object({
  q: z.string().optional(),                 // Término de búsqueda
  category: z.string().optional(),          // Filtro categoría
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  location: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20)
});

// ============================================================================
// 🛠️ UTILIDADES PARA VALIDAR
// ============================================================================

/**
 * Valida datos contra un schema y retorna resultado estructurado
 * 
 * @param {Object} data - Datos a validar
 * @param {z.ZodSchema} schema - Schema de Zod
 * @returns {Object} { success, data, errors }
 * 
 * @example
 * const result = validateSchema({ name: 'Test', price: 'invalid' }, propertyCreateSchema);
 * if (!result.success) {
 *   console.log(result.errors); // { price: 'expected number' }
 * }
 */
export const validateSchema = (data, schema) => {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated,
      errors: {}
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return {
        success: false,
        data: null,
        errors
      };
    }
    throw error;
  }
};

/**
 * Valida de forma segura (no lanza error, solo retorna resultado)
 * Usado en formularios para mostrar errores sin crashear
 * 
 * @param {Object} data - Datos a validar
 * @param {z.ZodSchema} schema - Schema de Zod
 * @returns {Object} { success, data, errors }
 */
export const safeParse = (data, schema) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = {};
    result.error.errors.forEach(err => {
      const field = err.path.join('.');
      errors[field] = err.message;
    });
    return {
      success: false,
      data: null,
      errors
    };
  }
  return {
    success: true,
    data: result.data,
    errors: {}
  };
};

/**
 * Obtiene lista de errores como strings para mostrar en toast/alert
 * 
 * @param {Object} errors - Objeto de errores de validación
 * @returns {string} Errores separados por saltos de línea
 */
export const getErrorMessages = (errors) => {
  return Object.values(errors).join('\n');
};

// ============================================================================
// Exportar todo
// ============================================================================

export const validationSchemas = {
  // Propiedades
  propertyCreateSchema,
  propertyUpdateSchema,
  propertyFilterSchema,
  
  // Auth
  loginSchema,
  signupSchema,
  userUpdateSchema,
  
  // Favoritos
  favoriteCreateSchema,
  
  // Búsqueda
  searchParamsSchema
};

export default validationSchemas;
