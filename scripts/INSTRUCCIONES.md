# Instrucciones de Importación de Socios

Este documento explica cómo utilizar el script para importar socios desde un archivo CSV a Google Sheets.

## 1. Preparar el archivo CSV

El archivo CSV debe tener los siguientes encabezados (el orden no importa, pero los nombres deben ser exactos):

*   `Nome e apelidos`
*   `Correo electrónico`
*   `Teléfono`
*   `Enderezo`
*   `CP, cidade e provincia`
*   `Columna 1` (Opcional, se mapea al estado/status)

Puedes ver un ejemplo en el archivo `socios.example.csv` en la raíz del proyecto.

## 2. Ubicación del archivo

Para mayor facilidad, coloca tu archivo CSV (por ejemplo, `mis_socios.csv`) en la **carpeta raíz** del proyecto (donde está `package.json`).

## 3. Ejecutar el script

Abre una terminal en la carpeta raíz del proyecto y ejecuta el siguiente comando:

```bash
node scripts/importPartners.js mis_socios.csv
```

*(Sustituye `mis_socios.csv` por el nombre real de tu archivo)*

Si no especificas un archivo, el script buscará por defecto `socios.csv`.

## Notas

*   El script creará automáticamente las columnas `address` y `CP` en la hoja de cálculo si no existen.
*   Si un correo electrónico ya existe en la hoja, se saltará ese registro para evitar duplicados.
