/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const record0 = new Record(collection);
    record0.set("name", "Habitaci\u00f3n Moderna Centro");
    record0.set("category", "Habitaciones alquiler");
    record0.set("description", "Habitaci\u00f3n luminosa con ba\u00f1o privado en el coraz\u00f3n del centro hist\u00f3rico. Incluye cama doble, escritorio y armario empotrado. Acceso a cocina compartida y zona com\u00fan.");
    record0.set("price", 450);
    record0.set("location", "Centro Hist\u00f3rico, Madrid");
    record0.set("availability", true);
    record0.set("detailed_features", "Ba\u00f1o privado, Ventanas grandes, Calefacci\u00f3n, Aire acondicionado, Wifi incluido");
    record0.set("contact_info", "Tel: +34 91 234 5678 | Email: info@habitaciones.es");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("name", "Cuarto Acogedor Barrio Universitario");
    record1.set("category", "Habitaciones alquiler");
    record1.set("description", "Habitaci\u00f3n acogedora en zona universitaria, perfecta para estudiantes. Amueblada con cama individual, estanter\u00eda y escritorio. Acceso a cocina y lavander\u00eda.");
    record1.set("price", 350);
    record1.set("location", "Barrio Universitario, Barcelona");
    record1.set("availability", true);
    record1.set("detailed_features", "Amueblada, Cocina compartida, Lavander\u00eda, Zona de estudio, Acceso 24h");
    record1.set("contact_info", "Tel: +34 93 456 7890 | Email: estudiantes@alquiler.es");
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("name", "Suite Ejecutiva Zona Negocios");
    record2.set("category", "Habitaciones alquiler");
    record2.set("description", "Habitaci\u00f3n de lujo con ba\u00f1o en suite, ideal para profesionales. Incluye cama king size, minibar, escritorio ejecutivo y acceso a gimnasio.");
    record2.set("price", 650);
    record2.set("location", "Zona Negocios, Valencia");
    record2.set("availability", true);
    record2.set("detailed_features", "Ba\u00f1o en suite, Minibar, Gimnasio, Servicio de limpieza, Wifi de alta velocidad");
    record2.set("contact_info", "Tel: +34 96 123 4567 | Email: ejecutivos@premium.es");
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("name", "Apartamento Inversi\u00f3n Centro Comercial");
    record3.set("category", "Inversiones");
    record3.set("description", "Apartamento de 2 dormitorios en zona de alto tr\u00e1fico comercial. Rentabilidad garantizada con inquilino actual. Excelente potencial de revalorizaci\u00f3n.");
    record3.set("price", 185000);
    record3.set("location", "Centro Comercial, Bilbao");
    record3.set("availability", true);
    record3.set("detailed_features", "2 dormitorios, Sal\u00f3n, Cocina equipada, Balc\u00f3n, Parking incluido, Rentabilidad 6% anual");
    record3.set("contact_info", "Tel: +34 94 567 8901 | Email: inversiones@realestate.es");
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("name", "Estudio Inversi\u00f3n Zona Tur\u00edstica");
    record4.set("category", "Inversiones");
    record4.set("description", "Estudio completamente amueblado en zona tur\u00edstica con alto potencial de alquiler vacacional. Documentaci\u00f3n legal completa y gesti\u00f3n disponible.");
    record4.set("price", 95000);
    record4.set("location", "Zona Tur\u00edstica, M\u00e1laga");
    record4.set("availability", true);
    record4.set("detailed_features", "Estudio amueblado, Cocina completa, Ba\u00f1o moderno, Terraza, Potencial alquiler vacacional 8% anual");
    record4.set("contact_info", "Tel: +34 95 234 5678 | Email: turismo@inversiones.es");
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record5 = new Record(collection);
    record5.set("name", "Loft Industrial Inversi\u00f3n Art\u00edstica");
    record5.set("category", "Inversiones");
    record5.set("description", "Loft de 120m\u00b2 en edificio hist\u00f3rico rehabilitado. Zona en expansi\u00f3n con galer\u00edas de arte y restaurantes. Inversi\u00f3n segura con potencial de crecimiento.");
    record5.set("price", 220000);
    record5.set("location", "Barrio Art\u00edstico, Sevilla");
    record5.set("availability", true);
    record5.set("detailed_features", "120m\u00b2, Techos altos, Luz natural, Zona com\u00fan, Comunidad activa, Potencial 7% anual");
    record5.set("contact_info", "Tel: +34 95 456 7890 | Email: arte@inversiones.es");
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record6 = new Record(collection);
    record6.set("name", "Chalet Familiar Zona Residencial");
    record6.set("category", "Propiedades en venta");
    record6.set("description", "Hermoso chalet de 3 plantas en zona residencial tranquila. Jard\u00edn de 500m\u00b2, piscina privada y garaje para 2 veh\u00edculos. Perfecto para familias.");
    record6.set("price", 450000);
    record6.set("location", "Zona Residencial, Madrid");
    record6.set("availability", true);
    record6.set("detailed_features", "3 plantas, 4 dormitorios, 3 ba\u00f1os, Piscina, Jard\u00edn 500m\u00b2, Garaje doble, Calefacci\u00f3n central");
    record6.set("contact_info", "Tel: +34 91 567 8901 | Email: chalets@venta.es");
  try {
    app.save(record6);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record7 = new Record(collection);
    record7.set("name", "Apartamento Lujo Frente al Mar");
    record7.set("category", "Propiedades en venta");
    record7.set("description", "Apartamento de lujo con vistas panor\u00e1micas al mar. Acabados premium, dom\u00f3tica completa y acceso directo a playa privada. Ubicaci\u00f3n privilegiada.");
    record7.set("price", 650000);
    record7.set("location", "Paseo Mar\u00edtimo, Barcelona");
    record7.set("availability", true);
    record7.set("detailed_features", "3 dormitorios, 2 ba\u00f1os, Terraza 80m\u00b2, Vistas al mar, Dom\u00f3tica, Piscina comunitaria, Seguridad 24h");
    record7.set("contact_info", "Tel: +34 93 678 9012 | Email: lujo@venta.es");
  try {
    app.save(record7);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record8 = new Record(collection);
    record8.set("name", "Casa R\u00fastica con Terreno");
    record8.set("category", "Propiedades en venta");
    record8.set("description", "Casa r\u00fastica rehabilitada en entorno rural. Terreno de 2 hect\u00e1reas, ideal para agricultura o ganader\u00eda. Agua y electricidad garantizadas.");
    record8.set("price", 280000);
    record8.set("location", "Zona Rural, Toledo");
    record8.set("availability", true);
    record8.set("detailed_features", "Casa 200m\u00b2, 3 dormitorios, Terreno 2 hect\u00e1reas, Pozo de agua, Electricidad, Acceso por carretera");
    record8.set("contact_info", "Tel: +34 92 567 8901 | Email: rural@venta.es");
  try {
    app.save(record8);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record9 = new Record(collection);
    record9.set("name", "Piso Moderno Centro Urbano");
    record9.set("category", "Propiedades en alquiler");
    record9.set("description", "Piso de 2 dormitorios completamente reformado en el coraz\u00f3n del centro urbano. Cocina abierta, suelos de parquet y acabados modernos. Disponible inmediatamente.");
    record9.set("price", 1200);
    record9.set("location", "Centro Urbano, Valencia");
    record9.set("availability", true);
    record9.set("detailed_features", "2 dormitorios, 1 ba\u00f1o, Cocina abierta, Parquet, Aire acondicionado, Ascensor, Trastero");
    record9.set("contact_info", "Tel: +34 96 234 5678 | Email: alquiler@pisos.es");
  try {
    app.save(record9);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record10 = new Record(collection);
    record10.set("name", "Apartamento Familiar Zona Verde");
    record10.set("category", "Propiedades en alquiler");
    record10.set("description", "Apartamento de 3 dormitorios en zona verde con parques cercanos. Ideal para familias con ni\u00f1os. Comunidad tranquila y segura.");
    record10.set("price", 1500);
    record10.set("location", "Zona Verde, Bilbao");
    record10.set("availability", true);
    record10.set("detailed_features", "3 dormitorios, 2 ba\u00f1os, Sal\u00f3n amplio, Cocina equipada, Balc\u00f3n, Parques cercanos, Zona segura");
    record10.set("contact_info", "Tel: +34 94 234 5678 | Email: familias@alquiler.es");
  try {
    app.save(record10);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record11 = new Record(collection);
    record11.set("name", "Estudio C\u00e9ntrico Estudiantes");
    record11.set("category", "Propiedades en alquiler");
    record11.set("description", "Estudio compacto y funcional en zona c\u00e9ntrica. Perfecto para estudiantes o profesionales j\u00f3venes. Transporte p\u00fablico a 2 minutos.");
    record11.set("price", 650);
    record11.set("location", "Centro Estudiantes, Sevilla");
    record11.set("availability", true);
    record11.set("detailed_features", "Estudio 35m\u00b2, Cocina equipada, Ba\u00f1o moderno, Calefacci\u00f3n, Wifi, Transporte p\u00fablico cercano");
    record11.set("contact_info", "Tel: +34 95 234 5678 | Email: estudiantes@alquiler.es");
  try {
    app.save(record11);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record12 = new Record(collection);
    record12.set("name", "Reforma Integral Edificio Hist\u00f3rico");
    record12.set("category", "Obras");
    record12.set("description", "Proyecto de reforma integral de edificio hist\u00f3rico de 6 plantas. Incluye restauraci\u00f3n de fachada, modernizaci\u00f3n de instalaciones y accesibilidad. Presupuesto detallado disponible.");
    record12.set("price", 450000);
    record12.set("location", "Centro Hist\u00f3rico, C\u00f3rdoba");
    record12.set("availability", true);
    record12.set("detailed_features", "6 plantas, Restauraci\u00f3n fachada, Nuevas instalaciones, Accesibilidad, Duraci\u00f3n estimada 18 meses, Licencias incluidas");
    record12.set("contact_info", "Tel: +34 95 567 8901 | Email: obras@construccion.es");
  try {
    app.save(record12);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record13 = new Record(collection);
    record13.set("name", "Ampliaci\u00f3n Vivienda Unifamiliar");
    record13.set("category", "Obras");
    record13.set("description", "Proyecto de ampliaci\u00f3n de 60m\u00b2 en vivienda unifamiliar. Incluye nuevo dormitorio, ba\u00f1o y zona de estar. Dise\u00f1o personalizado seg\u00fan necesidades.");
    record13.set("price", 85000);
    record13.set("location", "Zona Residencial, Murcia");
    record13.set("availability", true);
    record13.set("detailed_features", "Ampliaci\u00f3n 60m\u00b2, Nuevo dormitorio, Ba\u00f1o completo, Zona estar, Dise\u00f1o personalizado, Duraci\u00f3n 4 meses");
    record13.set("contact_info", "Tel: +34 96 678 9012 | Email: ampliaciones@obras.es");
  try {
    app.save(record13);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record14 = new Record(collection);
    record14.set("name", "Rehabilitaci\u00f3n Fachada y Cubierta");
    record14.set("category", "Obras");
    record14.set("description", "Proyecto de rehabilitaci\u00f3n de fachada y cubierta en edificio de viviendas. Incluye impermeabilizaci\u00f3n, aislamiento t\u00e9rmico y acabados modernos.");
    record14.set("price", 320000);
    record14.set("location", "Barrio Antiguo, Zaragoza");
    record14.set("availability", true);
    record14.set("detailed_features", "Fachada 800m\u00b2, Cubierta 600m\u00b2, Aislamiento t\u00e9rmico, Impermeabilizaci\u00f3n, Andamios incluidos, Duraci\u00f3n 6 meses");
    record14.set("contact_info", "Tel: +34 97 234 5678 | Email: rehabilitacion@obras.es");
  try {
    app.save(record14);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
