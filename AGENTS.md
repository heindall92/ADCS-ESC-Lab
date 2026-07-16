# ADCS ESC Lab — notas para agentes

Lab educativo local sobre los 16 ESC de ADCS (Certipy v5). Stack: TanStack Start, React 19, Tailwind v4, Nitro.

## Desarrollo local

```bash
npm install
npm run dev    # http://localhost:8080
npm run build
npm run preview
```

## Convenciones

- i18n ES/EN en `src/lib/i18n.tsx` y datos en `src/lib/data/`
- Tema glass global en `src/styles.css` (no reintroducir grid/glow ruidoso)
- 9 acentos de color vía `src/lib/accent-palette.ts` y `ThemeLangToggle`
- Contenido educativo: solo entornos de laboratorio autorizados

## Rutas principales

| Ruta | Uso |
|------|-----|
| `/` | Home + tutorial |
| `/mapa` | Mapa visual de ESC |
| `/tabla` | Tabla comparativa |
| `/esc/$escId` | Detalle por ESC |
| `/practica` | Escenarios guiados |
| `/decision` | Árbol de decisión |
| `/cheat-sheet` | Referencia rápida |
| `/blue-team` | Mitigaciones |
| `/parche` | Parches y hardening |
