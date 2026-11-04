import { appendFileSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { format, stripVTControlCharacters } from 'util';

/** Guarda también los mensajes existentes de console y Nest en archivos diarios. */
export function initializeFileLogging(directory = join(__dirname, '..', '..', 'logs')): () => void {
  const levels = ['log', 'info', 'warn', 'error', 'debug'] as const;
  const originals = Object.fromEntries(levels.map(level => [level, console[level]])) as
    Record<typeof levels[number], typeof console.log>;
  let activeDay = '';
  let failed = false;

  const write = (level: string, args: unknown[]) => {
    try {
      const now = new Date();
      const day = now.toISOString().slice(0, 10);
      if (day !== activeDay) {
        mkdirSync(directory, { recursive: true });
        // Conservar hoy y los trece días anteriores; ignorar otros archivos.
        const cutoff = new Date(now.getTime() - 13 * 86400000).toISOString().slice(0, 10);
        for (const filename of readdirSync(directory)) {
          if (/^app-\d{4}-\d{2}-\d{2}\.log$/.test(filename) && filename.slice(4, 14) < cutoff) {
            unlinkSync(join(directory, filename));
          }
        }
        activeDay = day;
      }
      const message = stripVTControlCharacters(format(...args));
      appendFileSync(join(directory, `app-${day}.log`), `${now.toISOString()} [${level.toUpperCase()}] ${message}\n`, { mode: 0o600 });
    } catch (error) {
      if (!failed) originals.error.call(console, 'No se pudo escribir en la carpeta de logs:', error);
      failed = true;
    }
  };

  for (const level of levels) {
    console[level] = (...args: unknown[]) => {
      write(level, args);
      originals[level].apply(console, args);
    };
  }

  console.log(`📁 Logs diarios: ${directory} (retención: 14 días; fechas UTC)`);
  return () => {
    for (const level of levels) console[level] = originals[level];
  };
}
