Slot 3x6 – Drop-in package
--------------------------
Archivos:
- Slot.tsx
- Slot.styles.ts
- paylines.ts

Cómo usar:
1) Copia estos archivos en la carpeta de tu juego de Slots.
2) Asegúrate de tener `constants.ts` exportando `SLOT_ITEMS: SlotItem[]` con campos al menos:
   { id: string; image: string; name?: string; kind?: 'wild'|'scatter' }
3) Importa y usa el componente por defecto `Slot3x6` en tu página de juego.
4) Conecta `handleSpin` a tu flujo real si necesitas control externo. Aquí viene listo para probar.

Notas:
- Paylines incluidas: 9.
- Grid fijo: 3 filas x 6 carretes.
- Sin dependencias nuevas. Estilos con styled-components.
