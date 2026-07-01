import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Vehicle Tracker API",
      version: "1.0.0",
      description: "REST API untuk Fleet Management Vehicle Tracker",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // AUTH
        RegisterBody: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Admin Fleet" },
            email: { type: "string", example: "admin@fleet.com" },
            password: { type: "string", example: "password123" },
            role: {
              type: "string",
              enum: ["admin", "operator", "viewer"],
              example: "admin",
            },
          },
        },
        LoginBody: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "admin@fleet.com" },
            password: { type: "string", example: "password123" },
          },
        },

        // VEHICLE
        Vehicle: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            plate_number: { type: "string", example: "AB 1234 CD" },
            brand: { type: "string", example: "Toyota" },
            model: { type: "string", example: "Avanza" },
            type: { type: "string", example: "MPV" },
            status: { type: "string", enum: ["active", "idle", "offline"] },
            current_driver_id: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
            driver_name: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" },
          },
        },
        CreateVehicleBody: {
          type: "object",
          required: ["plate_number", "brand", "model", "type"],
          properties: {
            plate_number: { type: "string", example: "AB 1234 CD" },
            brand: { type: "string", example: "Toyota" },
            model: { type: "string", example: "Avanza" },
            type: { type: "string", example: "MPV" },
          },
        },

        // DRIVER
        Driver: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user_id: { type: "string", format: "uuid" },
            license_number: { type: "string", example: "SIM-A-001234" },
            phone: { type: "string", example: "081234567890" },
            status: {
              type: "string",
              enum: ["available", "on_trip", "off_duty"],
            },
            name: { type: "string", example: "Budi Santoso" },
            email: { type: "string", example: "budi@fleet.com" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        CreateDriverBody: {
          type: "object",
          required: ["user_id", "license_number", "phone"],
          properties: {
            user_id: { type: "string", format: "uuid" },
            license_number: { type: "string", example: "SIM-A-001234" },
            phone: { type: "string", example: "081234567890" },
          },
        },

        // TRIP
        Trip: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            vehicle_id: { type: "string", format: "uuid" },
            driver_id: { type: "string", format: "uuid" },
            plate_number: { type: "string" },
            driver_name: { type: "string" },
            start_time: { type: "string", format: "date-time" },
            end_time: { type: "string", format: "date-time", nullable: true },
            distance_km: { type: "number", example: 25.5 },
            status: {
              type: "string",
              enum: ["ongoing", "completed", "cancelled"],
            },
          },
        },

        // ALERT
        Alert: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            vehicle_id: { type: "string", format: "uuid" },
            plate_number: { type: "string" },
            type: {
              type: "string",
              enum: [
                "speeding",
                "geofence_violation",
                "idle_too_long",
                "signal_lost",
              ],
            },
            message: { type: "string" },
            value: { type: "number", nullable: true },
            is_read: { type: "boolean" },
            triggered_at: { type: "string", format: "date-time" },
          },
        },

        // GEOFENCE
        Geofence: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Zona Kota Yogyakarta" },
            polygon_coords: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  lat: { type: "number" },
                  lng: { type: "number" },
                },
              },
            },
            is_active: { type: "boolean" },
            created_at: { type: "string", format: "date-time" },
          },
        },

        // ERROR
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],

    paths: {
      // ========== AUTH ==========
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register user baru",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterBody" },
              },
            },
          },
          responses: {
            201: { description: "Register berhasil" },
            409: { description: "Email sudah terdaftar" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login dan dapatkan JWT token",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginBody" },
              },
            },
          },
          responses: {
            200: { description: "Login berhasil, token dikembalikan" },
            401: { description: "Email atau password salah" },
          },
        },
      },

      "/api/dashboard/summary": {
        get: {
          tags: ["Dashboard"],
          summary: "Get summary keseluruhan fleet",
          responses: {
            200: { description: "Summary vehicles, drivers, trips, alerts" },
          },
        },
      },
      "/api/dashboard/fleet-stats": {
        get: {
          tags: ["Dashboard"],
          summary: "Get statistik fleet per hari",
          parameters: [
            {
              name: "days",
              in: "query",
              schema: { type: "integer", example: 7 },
              description: "Rentang hari (1-90)",
            },
          ],
          responses: {
            200: {
              description:
                "Daily trips, alert by type, top vehicles, top drivers",
            },
          },
        },
      },
      "/api/dashboard/recent-alerts": {
        get: {
          tags: ["Dashboard"],
          summary: "Get alert terbaru",
          parameters: [
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", example: 10 },
            },
          ],
          responses: { 200: { description: "List alert terbaru" } },
        },
      },

      // ========== VEHICLES ==========
      "/api/vehicles": {
        get: {
          tags: ["Vehicles"],
          summary: "Get semua kendaraan",
          responses: {
            200: {
              description: "List kendaraan",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Vehicle" },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Vehicles"],
          summary: "Tambah kendaraan baru (admin/operator)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateVehicleBody" },
              },
            },
          },
          responses: {
            201: { description: "Kendaraan berhasil ditambahkan" },
            409: { description: "Plat nomor sudah terdaftar" },
          },
        },
      },
      "/api/vehicles/{id}": {
        get: {
          tags: ["Vehicles"],
          summary: "Get kendaraan by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Data kendaraan" },
            404: { description: "Kendaraan tidak ditemukan" },
          },
        },
        put: {
          tags: ["Vehicles"],
          summary: "Update kendaraan (admin/operator)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateVehicleBody" },
              },
            },
          },
          responses: {
            200: { description: "Kendaraan berhasil diupdate" },
            404: { description: "Kendaraan tidak ditemukan" },
          },
        },
        delete: {
          tags: ["Vehicles"],
          summary: "Hapus kendaraan (admin only)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Kendaraan berhasil dihapus" },
            404: { description: "Kendaraan tidak ditemukan" },
          },
        },
      },
      "/api/vehicles/{id}/assign-driver": {
        post: {
          tags: ["Vehicles"],
          summary: "Assign driver ke kendaraan",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { driver_id: { type: "string", format: "uuid" } },
                },
              },
            },
          },
          responses: { 200: { description: "Driver berhasil di-assign" } },
        },
      },
      "/api/vehicles/{id}/unassign-driver": {
        post: {
          tags: ["Vehicles"],
          summary: "Unassign driver dari kendaraan",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { 200: { description: "Driver berhasil di-unassign" } },
        },
      },

      // ========== DRIVERS ==========
      "/api/drivers": {
        get: {
          tags: ["Drivers"],
          summary: "Get semua driver",
          responses: {
            200: {
              description: "List driver",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Driver" },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Drivers"],
          summary: "Tambah driver baru (admin/operator)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateDriverBody" },
              },
            },
          },
          responses: {
            201: { description: "Driver berhasil ditambahkan" },
            409: { description: "License number sudah terdaftar" },
          },
        },
      },
      "/api/drivers/{id}": {
        get: {
          tags: ["Drivers"],
          summary: "Get driver by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Data driver" },
            404: { description: "Driver tidak ditemukan" },
          },
        },
        put: {
          tags: ["Drivers"],
          summary: "Update driver (admin/operator)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { 200: { description: "Driver berhasil diupdate" } },
        },
        delete: {
          tags: ["Drivers"],
          summary: "Hapus driver (admin only)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { 200: { description: "Driver berhasil dihapus" } },
        },
      },
      "/api/drivers/{id}/history": {
        get: {
          tags: ["Drivers"],
          summary: "Get riwayat trip driver",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { 200: { description: "List riwayat trip driver" } },
        },
      },

      // ========== TRIPS ==========
      "/api/trips": {
        get: {
          tags: ["Trips"],
          summary: "Get semua trip",
          parameters: [
            { name: "vehicle_id", in: "query", schema: { type: "string" } },
            { name: "driver_id", in: "query", schema: { type: "string" } },
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["ongoing", "completed", "cancelled"],
              },
            },
            {
              name: "date_from",
              in: "query",
              schema: { type: "string", format: "date" },
            },
            {
              name: "date_to",
              in: "query",
              schema: { type: "string", format: "date" },
            },
          ],
          responses: {
            200: {
              description: "List trip",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Trip" },
                  },
                },
              },
            },
          },
        },
      },
      "/api/trips/report": {
        get: {
          tags: ["Trips"],
          summary: "Get laporan trip per periode",
          parameters: [
            {
              name: "date_from",
              in: "query",
              required: true,
              schema: { type: "string", format: "date", example: "2024-01-01" },
            },
            {
              name: "date_to",
              in: "query",
              required: true,
              schema: { type: "string", format: "date", example: "2024-01-31" },
            },
          ],
          responses: { 200: { description: "Summary laporan trip" } },
        },
      },
      "/api/trips/{id}": {
        get: {
          tags: ["Trips"],
          summary: "Get trip by ID + rute",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { 200: { description: "Detail trip beserta rute" } },
        },
      },
      "/api/trips/start": {
        post: {
          tags: ["Trips"],
          summary: "Mulai trip baru (admin/operator)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["vehicle_id", "driver_id"],
                  properties: {
                    vehicle_id: { type: "string", format: "uuid" },
                    driver_id: { type: "string", format: "uuid" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Trip berhasil dimulai" },
            409: {
              description: "Kendaraan atau driver sedang dalam perjalanan",
            },
          },
        },
      },
      "/api/trips/{id}/end": {
        post: {
          tags: ["Trips"],
          summary: "Akhiri trip (admin/operator)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    distance_km: { type: "number", example: 25.5 },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Trip berhasil diakhiri" } },
        },
      },

      // ========== TRACKING ==========
      "/api/tracking/live": {
        get: {
          tags: ["Tracking"],
          summary: "Get posisi terkini semua kendaraan",
          responses: { 200: { description: "List posisi kendaraan" } },
        },
      },
      "/api/tracking/live/{vehicleId}": {
        get: {
          tags: ["Tracking"],
          summary: "Get posisi terkini satu kendaraan",
          parameters: [
            {
              name: "vehicleId",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Posisi kendaraan" },
            404: { description: "Data lokasi tidak ditemukan" },
          },
        },
      },

      // ========== ALERTS ==========
      "/api/alerts": {
        get: {
          tags: ["Alerts"],
          summary: "Get semua alert",
          parameters: [
            { name: "vehicle_id", in: "query", schema: { type: "string" } },
            {
              name: "type",
              in: "query",
              schema: {
                type: "string",
                enum: [
                  "speeding",
                  "geofence_violation",
                  "idle_too_long",
                  "signal_lost",
                ],
              },
            },
            { name: "is_read", in: "query", schema: { type: "boolean" } },
          ],
          responses: {
            200: {
              description: "List alert",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Alert" },
                  },
                },
              },
            },
          },
        },
      },
      "/api/alerts/unread-count": {
        get: {
          tags: ["Alerts"],
          summary: "Get jumlah alert yang belum dibaca",
          responses: { 200: { description: "Jumlah alert unread" } },
        },
      },
      "/api/alerts/read-all": {
        put: {
          tags: ["Alerts"],
          summary: "Tandai semua alert sebagai sudah dibaca",
          responses: {
            200: { description: "Semua alert ditandai sudah dibaca" },
          },
        },
      },
      "/api/alerts/{id}/read": {
        put: {
          tags: ["Alerts"],
          summary: "Tandai satu alert sebagai sudah dibaca",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Alert ditandai sudah dibaca" },
            404: { description: "Alert tidak ditemukan" },
          },
        },
      },

      // ========== GEOFENCES ==========
      "/api/geofences": {
        get: {
          tags: ["Geofences"],
          summary: "Get semua geofence",
          responses: {
            200: {
              description: "List geofence",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Geofence" },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Geofences"],
          summary: "Buat geofence baru (admin only)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "polygon_coords"],
                  properties: {
                    name: { type: "string", example: "Zona Kota Yogyakarta" },
                    polygon_coords: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          lat: { type: "number" },
                          lng: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Geofence berhasil dibuat" } },
        },
      },
      "/api/geofences/{id}": {
        get: {
          tags: ["Geofences"],
          summary: "Get geofence by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { 200: { description: "Data geofence" } },
        },
        put: {
          tags: ["Geofences"],
          summary: "Update geofence (admin only)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { 200: { description: "Geofence berhasil diupdate" } },
        },
        delete: {
          tags: ["Geofences"],
          summary: "Hapus geofence (admin only)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: { 200: { description: "Geofence berhasil dihapus" } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
