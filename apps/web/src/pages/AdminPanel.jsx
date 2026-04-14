
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Plus, Trash2, Edit2, LogOut, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout, initialLoading } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    location: '',
    availability: true,
    detailed_features: '',
    contact_info: ''
  });
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialLoading && !isAdmin) {
      navigate('/login');
    }
  }, [initialLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProperties();
    }
  }, [isAdmin]);

  const fetchProperties = async () => {
    try {
      const records = await pb.collection('properties').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setProperties(records);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      location: '',
      availability: true,
      detailed_features: '',
      contact_info: ''
    });
    setImages([]);
    setEditingProperty(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name || '',
      category: property.category || '',
      description: property.description || '',
      price: property.price?.toString() || '',
      location: property.location || '',
      availability: property.availability ?? true,
      detailed_features: property.detailed_features || '',
      contact_info: property.contact_info || ''
    });
    setImages([]);
    setDialogOpen(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages].slice(0, 10));
    }
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        name: formData.name,
        category: formData.category || null,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        location: formData.location,
        availability: formData.availability,
        detailed_features: formData.detailed_features || null,
        contact_info: formData.contact_info || null
      };

      const formPayload = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formPayload.append(key, value);
        }
      });

      images.forEach(img => {
        formPayload.append('images', img.file);
      });

      if (editingProperty) {
        await pb.collection('properties').update(editingProperty.id, formPayload);
        toast.success('Propiedad actualizada correctamente');
      } else {
        await pb.collection('properties').create(formPayload);
        toast.success('Propiedad creada correctamente');
      }

      setDialogOpen(false);
      resetForm();
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Error al guardar la propiedad');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (property) => {
    if (window.confirm(`¿Estás seguro de eliminar "${property.name}"?`)) {
      try {
        await pb.collection('properties').delete(property.id);
        toast.success('Propiedad eliminada');
        fetchProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Error al eliminar la propiedad');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (initialLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Panel de Administración - Corina Capital</title>
      </Helmet>

      <div className="min-h-screen bg-muted/20">
        <header className="bg-white border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">Panel de Administración</h1>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {currentUser?.name || currentUser?.email}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={openCreateDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Propiedad
                </Button>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Propiedades ({properties.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No hay propiedades publicadas</p>
                  <Button onClick={openCreateDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear primera propiedad
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-border"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={pb.files.getUrl(property, property.images[0], { thumb: '100x100' })}
                            alt={property.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{property.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{property.location}</p>
                        <div className="flex gap-2 mt-1">
                          {property.category && (
                            <Badge variant="secondary" className="text-xs">
                              {property.category}
                            </Badge>
                          )}
                          {property.price && (
                            <Badge variant="outline" className="text-xs">
                              €{property.price.toLocaleString('es-ES')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={property.availability ? 'default' : 'secondary'}>
                          {property.availability ? 'Activa' : 'Inactiva'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(property)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(property)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}
              </DialogTitle>
              <DialogDescription>
                {editingProperty
                  ? 'Modifica los datos de la propiedad'
                  : 'Completa los datos para publicar una nueva propiedad'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Apartamento Vista Mar"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Habitaciones alquiler">Habitaciones alquiler</SelectItem>
                      <SelectItem value="Inversiones">Inversiones</SelectItem>
                      <SelectItem value="Propiedades en venta">Propiedades en venta</SelectItem>
                      <SelectItem value="Propiedades en alquiler">Propiedades en alquiler</SelectItem>
                      <SelectItem value="Obras">Obras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ej: Benalmádena, Costa del Sol"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ej: 250000"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={formData.availability}
                      onCheckedChange={(checked) => setFormData({ ...formData, availability: checked })}
                    />
                    <span className="text-sm">
                      {formData.availability ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe la propiedad..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="detailed_features">Características (una por línea)</Label>
                <Textarea
                  id="detailed_features"
                  value={formData.detailed_features}
                  onChange={(e) => setFormData({ ...formData, detailed_features: e.target.value })}
                  placeholder="3 habitaciones&#10;2 baños&#10;Piscina&#10;Garaje"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_info">Notas de contacto</Label>
                <Textarea
                  id="contact_info"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  placeholder="Notas adicionales para el equipo..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Fotos (máx. 10)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={images.length >= 10}
                  />
                  <label
                    htmlFor="images"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${
                      images.length >= 10 ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {images.length >= 10
                        ? 'Máximo de imágenes alcanzado'
                        : 'Haz clic o arrastra imágenes aquí'}
                    </span>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : editingProperty ? 'Actualizar' : 'Publicar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminPanel;
