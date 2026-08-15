/**
 * Fonction utilitaire d'export CSV générique.
 *
 * Convertit un tableau d'enregistrements en fichier CSV téléchargeable.
 * Gère l'échappement des champs contenant des virgules, des guillemets
 * ou des retours à la ligne (spécification RFC 4180).
 */

type CsvRecord = Record<string, string | number | boolean | null | undefined>;

/** Échappe un champ conforme à la RFC 4180 (nombres, virgules, guillemets). */
function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  // Encapsuler dans des guillemets si le champ contient des séparateurs ou quotes
  const needsQuoting = /[",\n\r]/.test(stringValue);
  if (!needsQuoting) return stringValue;
  return `"${stringValue.replace(/"/g, '""')}"`;
}

/**
 * Génère un CSV à partir d'enregistrements et déclenche son téléchargement.
 *
 * @param rows - Tableau d'objets dont les clés deviennent les en-têtes du CSV.
 * @param filename - Nom du fichier téléchargé (sans extension).
 */
export function exportCsv(rows: CsvRecord[], filename: string): void {
  if (!rows.length) {
    console.warn("[exportCsv] Aucune donnée à exporter.");
    return;
  }

  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeCsvField).join(",");
  const bodyLines = rows.map((row) =>
    headers.map((header) => escapeCsvField(row[header])).join(",")
  );

  const csvContent = [headerLine, ...bodyLines].join("\r\n");
  // Préfixe BOM pour une ouverture correcte sous Excel (encodage UTF-8)
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
