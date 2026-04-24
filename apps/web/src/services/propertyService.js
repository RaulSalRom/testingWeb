/**
 * 🏠 PROPERTY SERVICE
 * 
 * Centraliza toda la lógica de interacción con la colección "properties" en PocketBase.
 * Este es el ÚNICO archivo que debe comunicarse directamente con pb.collection('properties').
 * 
 * VENTAJAS de este patrón:
 * ✅ Un solo lugar para cambiar queries
 * ✅ Reutilizable en múltiples componentes
 * ✅ Fácil de testear
 * ✅ Cambios en la BD no rompen 10 componentes
 * 
 * ESTRUCTURA DE PROPERTIES en PocketBase:
 * {
 *   id: string (autogenerado)
 *   name: string (nombre de la propiedad)
 *   category: select (Habitaciones alquiler | Inversiones | Propiedades en venta | Propiedades en alquiler | Obras)
 *   description: text (descripción larga)
 *   price: number (precio)
 *   location: string (ubicación)
 *   availability: boolean (disponible o no)
 *   image: string (archivo/imagen)
 *   created: datetime (auto)
 *   updated: datetime (auto)
 * }
 */

import pb from '@/lib/pocketbaseClient';
import { logError } from '@/lib/logger';

// ============================================================================
// 🔍 LECTURA - Obtener propiedades
// ============================================================================

/**
 * Obtiene TODAS las propiedades con filtros opcionales
 * 
 * @param {Object} options - Opciones de búsqueda
 * @param {string} options.filter - Filtro PocketBase (ej: "price >= 100000")
 * @param {string} options.sort - Campo para ordenar (ej: "-created" para descendente)
 * @param {number} options.limit - Máximo de registros
 * @param {number} options.offset - Para paginación
 * @returns {Promise<Array>} Lista de propiedades
 * 
 * @example
 * // Obtener todas
 * const allProps = await propertyService.getAll();
 * 
 * // Obtener con filtros
 * const filtered = await propertyService.getAll({
 *   filter: 'category = "Propiedades en venta" && price < 500000',
 *   sort: '-price'
 * });
 * 
 * // Con paginación
 * const page1 = await propertyService.getAll({ limit: 20, offset: 0 });
 * const page2 = await propertyService.getAll({ limit: 20, offset: 20 });
 */
export const getAll = async (options = {}) => {
  try {
    const {
      filter = '',
      sort = '-created', // Por defecto, más recientes primero
      limit = 500,       // Máximo de resultados
      offset = 0,
      expand = undefined // Para expandir relaciones (si existe)
    } = options;

    const dbOptions = {
      sort,
      limit,
      offset
    };

    // Si hay filtro, lo agregamos
    if (filter) {
      dbOptions.filter = filter;
    }

    // Si hay expansión de relaciones, lo agregamos
    if (expand) {
      dbOptions.expand = expand;
    }

    const records = await pb.collection('properties').getFullList(dbOptions);
    return records;
  } catch (error) {
    logError(error, 'propertyService.getAll');
    throw error;
  }
};

/**
 * Obtiene UNA propiedad por ID
 * 
 * @param {string} id - ID de la propiedad
 * @returns {Promise<Object>} Propiedad encontrada
 * @throws Error si no existe
 */
export const getById = async (id) => {
  try {
    if (!id) throw new Error('ID de propiedad requerido');
    
    const record = await pb.collection('properties').getOne(id);
    return record;
  } catch (error) {
    logError(error, `propertyService.getById(${id})`);
    throw error;
  }
};

/**
 * Busca propiedades por coincidencia de texto
 * Busca en name, description y location
 * 
 * @param {string} searchTerm - Término de búsqueda
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Array>} Resultados de búsqueda
 * 
 * @example
 * const results = await propertyService.search('apartamento madrid');
 */
export const search = async (searchTerm, options = {}) => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const searchLower = searchTerm.toLowerCase();
    
    // Construir filtro case-insensitive
    // PocketBase usa ~ para contains (similar a LIKE en SQL)
    const filter = `
      name ~ "${searchLower}" ||
      description ~ "${searchLower}" ||
      location ~ "${searchLower}"
    `;

    return await getAll({
      ...options,
      filter
    });
  } catch (error) {
    logError(error, `propertyService.search(${searchTerm})`);
    throw error;
  }
};

/**
 * Obtiene propiedades por categoría
 * 
 * @param {string} category - Categoría a filtrar
 * @returns {Promise<Array>} Propiedades de esa categoría
 * 
 * @example
 * const rentals = await propertyService.getByCategory('Propiedades en alquiler');
 */
export const getByCategory = async (category) => {
  try {
    if (!category) throw new Error('Categoría requerida');
    
    return await getAll({
      filter: `category = "${category}"`
    });
  } catch (error) {
    logError(error, `propertyService.getByCategory(${category})`);
    throw error;
  }
};

// ============================================================================
// ➕ CREAR - Agregar nueva propiedad
// ============================================================================

/**
 * Crea una nueva propiedad
 * Solo admin/editor pueden crear
 * 
 * @param {Object} data - Datos de la propiedad
 * @param {string} data.name - Nombre (requerido)
 * @param {string} data.location - Ubicación (requerido)
 * @param {string} data.category - Categoría
 * @param {number} data.price - Precio
 * @param {string} data.description - Descripción
 * @param {boolean} data.availability - ¿Disponible?
 * @param {File} data.image - Archivo de imagen
 * 
 * @returns {Promise<Object>} Propiedad creada
 * 
 * @example
 * const newProperty = await propertyService.create({
 *   name: 'Apartamento Centro',
 *   location: 'Madrid Centro',
 *   category: 'Propiedades en alquiler',
 *   price: 1500,
 *   description: 'Apartamento moderno en el centro',
 *   availability: true,
 *   image: fileObject
 * });
 */
export const create = async (data) => {
  try {
    // Validar datos mínimos
    if (!data.name || !data.location) {
      throw new Error('Nombre y ubicación son requeridos');
    }

    const formData = new FormData();
    
    // Agregar campos de texto
    formData.append('name', data.name);
    formData.append('location', data.location);
    
    // Campos opcionales
    if (data.category) formData.append('category', data.category);
    if (data.price !== undefined) formData.append('price', data.price);
    if (data.description) formData.append('description', data.description);
    if (data.availability !== undefined) formData.append('availability', data.availability);
    
    // Manejar imagen si existe
    if (data.image) {
      formData.append('image', data.image);
    }

    const record = await pb.collection('properties').create(formData);
    return record;
  } catch (error) {
    logError(error, 'propertyService.create');
    throw error;
  }
};

// ============================================================================
// ✏️ ACTUALIZAR - Editar propiedad existente
// ============================================================================

/**
 * Actualiza una propiedad existente
 * 
 * @param {string} id - ID de la propiedad a actualizar
 * @param {Object} data - Datos a actualizar (solo los que cambien)
 * @returns {Promise<Object>} Propiedad actualizada
 * 
 * @example
 * const updated = await propertyService.update('prop123', {
 *   price: 2000,
 *   availability: false
 * });
 */
export const update = async (id, data) => {
  try {
    if (!id) throw new Error('ID de propiedad requerido');
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Datos de actualización requeridos');
    }

    const formData = new FormData();
    
    // Agregar todos los campos a actualizar
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        if (data[key] instanceof File) {
          formData.append(key, data[key]);
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    const record = await pb.collection('properties').update(id, formData);
    return record;
  } catch (error) {
    logError(error, `propertyService.update(${id})`);
    throw error;
  }
};

// ============================================================================
// 🗑️ ELIMINAR - Borrar propiedad
// ============================================================================

/**
 * Elimina una propiedad
 * Solo admin o creador pueden eliminar
 * 
 * @param {string} id - ID de la propiedad a eliminar
 * @returns {Promise<boolean>} true si fue exitoso
 * 
 * @example
 * const deleted = await propertyService.delete('prop123');
 */
export const deleteProperty = async (id) => {
  try {
    if (!id) throw new Error('ID de propiedad requerido');
    
    await pb.collection('properties').delete(id);
    return true;
  } catch (error) {
    logError(error, `propertyService.delete(${id})`);
    throw error;
  }
};

// ============================================================================
// ⭐ FAVORITOS - Gestionar propiedades favoritas
// ============================================================================

/**
 * Obtiene IDs de propiedades favoritas del usuario actual
 * 
 * @returns {Promise<Array<string>>} Array de IDs de propiedades favoritas
 */
export const getFavoriteIds = async () => {
  try {
    const user = pb.authStore.model;
    if (!user) throw new Error('Usuario no autenticado');

    const favorites = await pb
      .collection('favorites')
      .getFullList({
        filter: `userId = "${user.id}"`,
        fields: 'propertyId'
      });

    return favorites.map(fav => fav.propertyId);
  } catch (error) {
    logError(error, 'propertyService.getFavoriteIds');
    return [];
  }
};

/**
 * Obtiene propiedades completas favoritas del usuario
 * 
 * @returns {Promise<Array>} Array de propiedades favoritas
 */
export const getFavoriteProperties = async () => {
  try {
    const user = pb.authStore.model;
    if (!user) throw new Error('Usuario no autenticado');

    // Opción 1: Obtener favoritos expandidos
    const favorites = await pb
      .collection('favorites')
      .getFullList({
        filter: `userId = "${user.id}"`,
        expand: 'propertyId'
      });

    // Extraer las propiedades expandidas
    return favorites.map(fav => fav.expand?.propertyId).filter(Boolean);
  } catch (error) {
    logError(error, 'propertyService.getFavoriteProperties');
    return [];
  }
};

/**
 * Verifica si una propiedad es favorita del usuario
 * 
 * @param {string} propertyId - ID de la propiedad
 * @returns {Promise<boolean>} true si es favorito
 */
export const isFavorite = async (propertyId) => {
  try {
    const user = pb.authStore.model;
    if (!user) return false;

    const favorite = await pb
      .collection('favorites')
      .getFirst(`userId = "${user.id}" && propertyId = "${propertyId}"`);

    return !!favorite;
  } catch (error) {
    // Si no encuentra registro, no es favorito (no es error)
    return false;
  }
};

/**
 * Agrega una propiedad a favoritos
 * 
 * @param {string} propertyId - ID de la propiedad
 * @returns {Promise<Object>} Registro de favorito creado
 */
export const addFavorite = async (propertyId) => {
  try {
    const user = pb.authStore.model;
    if (!user) throw new Error('Usuario no autenticado');

    // Verificar que la propiedad existe
    await getById(propertyId);

    // Crear el favorito
    const favorite = await pb.collection('favorites').create({
      userId: user.id,
      propertyId
    });

    return favorite;
  } catch (error) {
    logError(error, `propertyService.addFavorite(${propertyId})`);
    throw error;
  }
};

/**
 * Elimina una propiedad de favoritos
 * 
 * @param {string} propertyId - ID de la propiedad
 * @returns {Promise<boolean>} true si fue exitoso
 */
export const removeFavorite = async (propertyId) => {
  try {
    const user = pb.authStore.model;
    if (!user) throw new Error('Usuario no autenticado');

    // Buscar el registro de favorito
    const favorite = await pb
      .collection('favorites')
      .getFirst(`userId = "${user.id}" && propertyId = "${propertyId}"`);

    if (!favorite) {
      throw new Error('Este favorito no existe');
    }

    // Eliminar el registro
    await pb.collection('favorites').delete(favorite.id);
    return true;
  } catch (error) {
    logError(error, `propertyService.removeFavorite(${propertyId})`);
    throw error;
  }
};

// ============================================================================
// 📊 UTILIDADES - Estadísticas y datos agregados
// ============================================================================

/**
 * Obtiene estadísticas de propiedades
 * 
 * @returns {Promise<Object>} Objeto con estadísticas
 * 
 * @example
 * const stats = await propertyService.getStats();
 * // { total: 45, byCategory: {...}, avgPrice: 250000 }
 */
export const getStats = async () => {
  try {
    const all = await getAll();
    
    const stats = {
      total: all.length,
      byCategory: {},
      avgPrice: 0,
      priceRange: { min: 0, max: 0 }
    };

    // Calcular por categoría
    all.forEach(prop => {
      if (prop.category) {
        stats.byCategory[prop.category] = (stats.byCategory[prop.category] || 0) + 1;
      }
    });

    // Calcular precio promedio
    const withPrice = all.filter(p => p.price);
    if (withPrice.length > 0) {
      stats.avgPrice = Math.round(
        withPrice.reduce((sum, p) => sum + p.price, 0) / withPrice.length
      );
      stats.priceRange.min = Math.min(...withPrice.map(p => p.price));
      stats.priceRange.max = Math.max(...withPrice.map(p => p.price));
    }

    return stats;
  } catch (error) {
    logError(error, 'propertyService.getStats');
    throw error;
  }
};

// ============================================================================
// Exportar como objeto para fácil importación
// ============================================================================

const propertyService = {
  // Lectura
  getAll,
  getById,
  search,
  getByCategory,
  
  // Crear
  create,
  
  // Actualizar
  update,
  
  // Eliminar
  deleteProperty,
  
  // Favoritos
  getFavoriteIds,
  getFavoriteProperties,
  isFavorite,
  addFavorite,
  removeFavorite,
  
  // Utilidades
  getStats
};

export default propertyService;
