<p align="center">
  <img src="docs/readme-banner.svg" alt="ADCS ESC Lab — Aprende a identificar los 16 ESC con Certipy v5" width="100%"/>
</p>

**Lab educativo multimedia · Active Directory Certificate Services · Certipy v5**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.x-FF4154?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Use](https://img.shields.io/badge/Use-Labs%20autorizados-red?style=flat-square)

> **Solo para entornos controlados y autorizados:** HackTheBox, TryHackMe, VulnHub, laboratorios propios y entornos de práctica con permiso explícito.

---

## ¿Qué es ADCS ESC Lab?

ADCS ESC Lab es una aplicación web local para **aprender a identificar y entender los 16 casos ESC** (Escalation Scenarios) de Active Directory Certificate Services, alineada con **Certipy v5**.

Combina mapa visual, tabla comparativa, fichas por ESC, escenarios guiados, árbol de decisión, cheat sheet y sección blue team — todo con interfaz **glassmorphism**, **9 acentos de color** e **i18n ES/EN**.

El flujo típico en un lab con ADCS:

```
certipy-ad find → identificar ESC → leer vector en /esc/ESCn → practicar en /practica → mitigar en /blue-team
```

---

## Características

- **16 ESC documentados** — Desde ESC1 hasta ESC16, agrupados por vector (plantillas, ACL, configuración, relay, mapping, CA)
- **Mapa interactivo** — Vista visual del recorrido y relaciones entre casos
- **Tabla comparativa** — Criterios, prerrequisitos y señales de detección en un vistazo
- **Práctica guiada** — Escenarios con contexto de laboratorio y comandos Certipy
- **Árbol de decisión** — Ayuda a acotar qué ESC investigar según el output
- **Cheat sheet** — Referencia rápida para pentest en lab
- **Blue team** — Mitigaciones, parches y hardening
- **UI glass** — Tema oscuro con paneles translúcidos, mesh de color y paleta intercambiable
- **100% local** — Sin dependencias de plataformas externas; listo para clonar y desplegar tú mismo

---

## Requisitos

| Requisito | Versión |
|-----------|---------|
| Node.js | 20+ |
| npm | 10+ |

Herramientas de referencia en el lab (no incluidas en el repo):

| Tool | Uso |
|------|-----|
| `certipy-ad` | Enumeración y explotación ADCS (v5) |
| `BloodHound` | Visualización de relaciones AD |
| `netexec` / `impacket` | Validación de credenciales y relay |

---

## Inicio rápido

```bash
# Clonar (ajusta la URL cuando subas el repo)
git clone https://github.com/heindall92/adcs-esc-lab.git
cd adcs-esc-lab

# Instalar dependencias
npm install

# Desarrollo — http://localhost:8080
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview
```

---

## Rutas de la aplicación

| Ruta | Descripción |
|------|-------------|
| `/` | Home, hero con terminal animado y tutorial |
| `/mapa` | Mapa visual de los ESC |
| `/tabla` | Tabla comparativa de todos los casos |
| `/esc/$escId` | Detalle individual (ej. `/esc/ESC1`) |
| `/practica` | Escenarios de práctica guiada |
| `/decision` | Árbol de decisión |
| `/cheat-sheet` | Referencia rápida |
| `/blue-team` | Mitigaciones defensivas |
| `/parche` | Parches y recomendaciones de hardening |

---

## Estructura del proyecto

```
adcs-esc-lab/
├── docs/
│   ├── readme-banner.svg      # Banner hero para este README
│   └── adcs_esc_lab_card.svg  # Tarjeta para README de perfil GitHub
├── public/                    # favicon, og.png
├── src/
│   ├── routes/                # Páginas TanStack Router
│   ├── components/            # UI, sidebar, tutorial
│   ├── lib/
│   │   ├── data/              # Contenido ADCS ES/EN
│   │   ├── i18n.tsx           # Traducciones
│   │   ├── theme.tsx          # Tema claro/oscuro + acentos
│   │   └── accent-palette.ts  # 9 colores de acento
│   ├── styles.css             # Design system + glass global
│   ├── server.ts              # Entry SSR con manejo de errores
│   └── start.ts               # Middleware TanStack Start
├── vite.config.ts
└── package.json
```

---

## Tarjeta para tu README de perfil

Cuando subas el repo, añade esta tarjeta en la sección **Proyectos** de tu [README de perfil](https://github.com/heindall92/heindall92) (mismo estilo que JUDAS, Heimdall, etc.):

```html
<a href="https://github.com/heindall92/adcs-esc-lab">
  <img
    src="https://raw.githubusercontent.com/heindall92/adcs-esc-lab/main/docs/adcs_esc_lab_card.svg"
    alt="ADCS ESC Lab"
    width="400"
  />
</a>
```

Vista previa local de la tarjeta:

<p align="center">
  <img src="docs/adcs_esc_lab_card.svg" alt="ADCS ESC Lab card" width="854"/>
</p>

---

## Scripts disponibles

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo en `:8080` |
| `npm run build` | Build de producción (Nitro + cliente) |
| `npm run preview` | Previsualizar el build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Aviso legal

Este proyecto es **exclusivamente educativo** y está pensado para uso en entornos de práctica **controlados y autorizados**. El uso contra sistemas sin autorización explícita es ilegal. El autor no se hace responsable del mal uso de esta herramienta ni del material que documenta.

---

## Autor

**Yoandy Ramírez Delgado** · Junior Pentester · eJPTv2

[![LinkedIn](https://img.shields.io/badge/LinkedIn-yoandyrd92-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/yoandyrd92/)
[![HackTheBox](https://img.shields.io/badge/HTB-heindall-9FEF00?style=flat-square&logo=hackthebox&logoColor=black)](https://app.hackthebox.com/profile/heindall)
[![GitHub](https://img.shields.io/badge/GitHub-heindall92-181717?style=flat-square&logo=github)](https://github.com/heindall92)
