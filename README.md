# Mini E-Commerce - Frontend (FrontMiniArgentina)

Este repositorio contiene la interfaz de usuario (Frontend) para la plataforma Mini E-Commerce. Está construida como una Single Page Application (SPA) utilizando **React** y herramientas modernas para asegurar una experiencia de usuario rápida, dinámica y adaptativa.

---

## 🚀 Funcionalidad General

El frontend está dividido en dos grandes áreas funcionales:

1. **La Tienda Pública (Storefront):** Es la interfaz que ven los clientes. Les permite navegar por el catálogo de productos (por categorías), ver detalles de los mismos, y agregar artículos a un carrito de compras. El proceso de compra finaliza redirigiendo al usuario a WhatsApp con un mensaje pre-armado detallando su pedido.
2. **El Panel Administrativo (Admin Dashboard):** Una sección privada protegida con contraseña donde el dueño de la tienda puede gestionar el catálogo.

---

## 🛠️ Funcionalidades Específicas

1. **Catálogo de Productos y Carrito:**
   - **Visualización Dinámica:** Carruseles animados para destacar productos, y cuadrículas adaptativas para explorar categorías (ej. Hogar y Electrónica).
   - **Gestión de Carrito:** Un carrito flotante e interactivo que persiste el estado durante la navegación, calculando el total a pagar en tiempo real.
   - **Checkout por WhatsApp:** Al confirmar la compra, se genera un enlace a WhatsApp que incluye los detalles del pedido, facilitando la conversión sin necesidad de pasarelas de pago complejas.

2. **Panel de Administrador (`/admin`):**
   - **Login Seguro:** Pantalla de autenticación para validar las credenciales del usuario administrador.
   - **CRUD de Productos:** Interfaz visual para añadir nuevos productos, subir imágenes con vista previa en tiempo real, editar precios/stock, y eliminar productos descontinuados.
   - **Gestión de Cuenta:** Sección dedicada donde el administrador puede cambiar sus credenciales de acceso (usuario y contraseña) usando un PIN de seguridad.

3. **Experiencia de Usuario (UX) e Interfaz (UI):**
   - **Diseño Responsivo:** Completamente adaptable a dispositivos móviles, tablets y monitores de escritorio.
   - **Animaciones Fluidas:** Incorporación de animaciones suaves (transiciones de páginas, carrusel, notificaciones *toast* al agregar productos) para un diseño de primera calidad.
   - **Notificaciones Toast:** Alertas visuales dinámicas que informan al usuario sobre acciones exitosas (como agregar un ítem al carrito).

4. **Contacto y Comunicación:**
   - **Formulario Integrado:** Una sección dedicada de contacto que permite a los usuarios enviar mensajes o consultas directamente desde la web.
   - **Integración con Backend:** Los datos son validados y enviados a la API, la cual procesa y envía el correo electrónico, brindando retroalimentación visual (éxito/error) al usuario en tiempo real.

---

## 💻 Tecnologías y Herramientas Usadas

- **React (v19):** Librería principal para la construcción de interfaces de usuario basadas en componentes.
- **Vite:** Empaquetador web ultrarrápido (bundler) utilizado para un entorno de desarrollo ágil y una construcción (build) altamente optimizada para producción.
- **React Router DOM (v7):** Herramienta para el manejo de rutas del lado del cliente, permitiendo la navegación fluida entre páginas sin recargar el navegador.
- **Framer Motion (`motion`):** Librería de animaciones de nivel profesional utilizada para las transiciones, el comportamiento del carrusel de productos y elementos interactivos.
- **PostCSS (con `postcss-nesting`):** Procesador CSS que permite escribir hojas de estilo modernas utilizando "CSS Nesting" (anidación nativa de reglas) manteniendo el código limpio y modular, sin necesidad de compiladores pesados como SASS.
- **Lucide React & React Icons:** Conjuntos de iconos vectoriales ligeros y escalables para ilustrar la interfaz (iconos de carrito, usuario, menú, etc.).
- **ESLint:** Herramienta de análisis de código estático para identificar patrones problemáticos y mantener un estándar de calidad en el código JavaScript/React.
- **Docker & Caddy:** Herramientas de contenedorización y servidor web utilizadas para empaquetar y servir la aplicación en producción.
- **GitHub Actions:** CI/CD configurado para automatizar la construcción y publicación de la imagen en Docker Hub/GHCR.

---

## 🚀 Despliegue e Infraestructura

Al igual que el backend, el frontend está optimizado para su fácil despliegue en producción:
- Construido en una imagen estática mediante **Docker** y servido a través de **Nginx/Caddy**.
- El enrutamiento de peticiones a la API del backend se maneja mediante Caddy como Reverse Proxy, evitando así problemas de CORS (usando el mismo dominio base `ledclean.ar`).
- Se comunica directamente con el contenedor del backend para cargar las imágenes de los productos desde el directorio estático compartido.
